# API制限・制約

## 概要

外部サービスAPIの利用における制限事項、レート制限、認証スコープ、タイムアウト等の問題を記録し、効果的な回避策を提供します。

## 主要API制限分類

### 🔑 GitHub API制限

#### 認証・スコープ関連

**Personal Access Token (PAT) スコープ不足**
```yaml
問題パターン:
  - "Resource not accessible by integration" エラー
  - "Insufficient privileges" エラー
  - プライベートリポジトリへのアクセス拒否

必要スコープ:
  GitHub Projects: project, read:org
  リポジトリ操作: repo
  Actions管理: workflow
  組織情報: read:org
  
検証方法:
  gh auth status で現在のスコープ確認
```

**解決手順**
```bash
# 1. 現在のスコープ確認
gh auth status

# 2. 不足スコープがある場合は再認証
gh auth login --scopes "project,read:org,repo,workflow"

# 3. 特定の操作で権限エラーが出る場合
gh auth refresh --scopes "project,read:org,repo,workflow"

# 4. トークンの有効性確認
gh api user
```

#### レート制限

**GitHub API Rate Limits**
```yaml
制限内容:
  認証済み: 5,000 requests/hour
  未認証: 60 requests/hour
  検索API: 30 requests/minute
  GraphQL: 5,000 points/hour

影響する操作:
  - 大量のissue/PR作成
  - リポジトリ一覧取得
  - 検索クエリ実行
  - Project管理操作
```

**対処策**
```bash
# 1. 現在のレート制限状況確認
gh api rate_limit

# 2. 制限に近づいた場合の待機
sleep_until_reset() {
    local reset_time=$(gh api rate_limit | jq -r '.rate.reset')
    local current_time=$(date +%s)
    local wait_time=$((reset_time - current_time))
    
    if [ $wait_time -gt 0 ]; then
        echo "Rate limit reached. Waiting ${wait_time} seconds..."
        sleep $wait_time
    fi
}

# 3. バッチ処理での制限回避
for item in "${items[@]}"; do
    gh api "endpoint/${item}"
    sleep 1  # 1秒間隔で実行
done
```

#### GitHub Projects API特有の制限

**Project Items管理制限**
```yaml
制限事項:
  - プロジェクトV2 APIは比較的新しく制限が厳しい
  - 大量のアイテム追加時の処理時間
  - フィールド更新時の競合状態

実績ある操作:
  ✓ プロジェクト一覧取得
  ✓ アイテム追加・削除
  ✓ ステータス更新
  
制限のある操作:
  ⚠️ 一括更新（要注意）
  ⚠️ カスタムフィールド操作
  ❌ 複雑なクエリ・フィルタ
```

**推奨使用パターン**
```bash
# 1. 段階的なプロジェクト操作
gh project item-add <project-id> --url <issue-url>
sleep 2  # 操作間に待機時間

# 2. エラーハンドリングつき実行
safe_project_operation() {
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if gh project item-add "$@"; then
            return 0
        else
            retry_count=$((retry_count + 1))
            sleep $((retry_count * 2))  # 指数バックオフ
        fi
    done
    
    echo "Failed after $max_retries retries"
    return 1
}
```

### 🔧 その他の外部API制限

#### AWS API制限（将来のS3統合で想定）

**S3 API制限**
```yaml
リクエスト制限:
  PUT/COPY/POST/DELETE: 3,500 requests/second
  GET/HEAD: 5,500 requests/second
  LIST: 3,500 requests/second

制限回避:
  - プリサインドURL活用
  - バッチアップロード
  - 指数バックオフリトライ
```

**推奨実装パターン**
```bash
# プリサインドURL生成（制御プレーン）
generate_presigned_url() {
    aws s3 presign s3://bucket/key --expires-in 3600
}

# 直接アップロード（データプレーン）
upload_with_presigned() {
    local presigned_url="$1"
    local file_path="$2"
    
    curl -X PUT -T "$file_path" "$presigned_url"
}
```

#### NPMレジストリ制限

**パッケージインストール制限**
```yaml
制限内容:
  - 同時接続数制限
  - 帯域幅制限
  - タイムアウト設定

対処法:
  - キャッシュ活用
  - ミラーサイト利用
  - オフラインモード活用
```

## ネットワーク・接続問題

### 🌐 接続タイムアウト・不安定性

#### タイムアウト設定の調整

**Git操作のタイムアウト**
```bash
# Git設定でタイムアウト延長
git config --global http.postBuffer 524288000  # 500MB
git config --global http.timeout 600  # 10分

# 大容量ファイル用の設定
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 300
```

**curl/wgetでのタイムアウト対応**
```bash
# curl: リトライ・タイムアウト設定
curl --retry 3 --retry-delay 5 --max-time 300 --connect-timeout 60 <url>

# wget: タイムアウト・リトライ設定
wget --timeout=300 --tries=3 --waitretry=5 <url>
```

#### 不安定な接続への対応

**リトライ機構つきダウンロード**
```bash
robust_download() {
    local url="$1"
    local output="$2"
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Attempt $attempt/$max_attempts: $url"
        
        if curl -L --fail --retry 2 --retry-delay 3 \
               --max-time 180 --connect-timeout 30 \
               -o "$output" "$url"; then
            echo "Download successful"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep $((attempt * 2))  # 指数バックオフ
    done
    
    echo "Download failed after $max_attempts attempts"
    return 1
}
```

### 📡 プロキシ・ファイアウォール問題

#### 企業環境での制約

**プロキシ設定**
```bash
# 環境変数でのプロキシ設定
export http_proxy="http://proxy.company.com:8080"
export https_proxy="http://proxy.company.com:8080"
export no_proxy="localhost,127.0.0.1,.company.com"

# Git専用プロキシ設定
git config --global http.proxy http://proxy.company.com:8080
git config --global https.proxy http://proxy.company.com:8080

# npm プロキシ設定
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

**ファイアウォール・ポート制限**
```yaml
一般的な制限:
  - SSH (22番ポート) ブロック
  - 非標準HTTPSポート制限
  - 特定ドメインへのアクセス制限

代替手段:
  - HTTPS経由でのGit操作
  - VPN・トンネリング
  - 代替ミラーサイト利用
```

## サービス仕様変更・非推奨化

### 📅 APIバージョン管理

#### GitHub API v3 → v4 移行

**影響を受ける可能性のある操作**
```yaml
GitHub CLI:
  現状: REST API (v3) 中心
  将来: GraphQL (v4) 移行可能性
  
対応方針:
  - GitHub CLI最新版の定期的更新
  - 代替手段の準備
  - 手動操作フォールバック
```

**バージョン確認・更新手順**
```bash
# GitHub CLI バージョン確認
gh version

# アップデート手順（必要に応じて）
# 1. 現在のインストール方法確認
which gh

# 2. 最新版ダウンロード・更新
wget -O gh_latest.tar.gz "https://github.com/cli/cli/releases/latest/download/gh_*_linux_amd64.tar.gz"
tar -xf gh_latest.tar.gz
cp gh_*/bin/gh ~/.local/bin/

# 3. 動作確認
gh version
gh auth status
```

### 🔄 互換性の維持

#### 下位互換性のあるスクリプト作成

**Feature Detection パターン**
```bash
# 機能の有無確認
has_github_cli() {
    command -v gh >/dev/null 2>&1
}

has_project_support() {
    gh project list --help >/dev/null 2>&1
}

# フォールバック機構
manage_project_item() {
    if has_github_cli && has_project_support; then
        gh project item-add "$@"
    else
        echo "Manual action required: Add item to project"
        echo "Project: $1, Item: $2"
    fi
}
```

## 監視・アラート設定

### 📊 API使用量モニタリング

#### GitHub API使用量追跡

**自動監視スクリプト**
```bash
#!/bin/bash
# github_api_monitor.sh

check_github_limits() {
    local limit_info=$(gh api rate_limit 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        local remaining=$(echo "$limit_info" | jq -r '.rate.remaining')
        local limit=$(echo "$limit_info" | jq -r '.rate.limit')
        local reset_time=$(echo "$limit_info" | jq -r '.rate.reset')
        
        local usage_percent=$(( (limit - remaining) * 100 / limit ))
        
        echo "GitHub API Usage: ${usage_percent}% (${remaining}/${limit})"
        
        if [ $usage_percent -gt 80 ]; then
            echo "WARNING: High API usage detected"
            local reset_date=$(date -d "@$reset_time")
            echo "Rate limit resets at: $reset_date"
        fi
    else
        echo "ERROR: Cannot access GitHub API"
    fi
}

# 実行
check_github_limits
```

#### 異常検知・通知

**しきい値ベースアラート**
```bash
# 使用量が80%を超えた場合の通知
monitor_and_alert() {
    local usage=$(check_github_limits | grep -o '[0-9]\+%' | cut -d'%' -f1)
    
    if [ "$usage" -gt 80 ]; then
        # Slack/email通知（設定されている場合）
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"GitHub API usage high: ${usage}%\"}" \
             "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
}
```

## 緊急時対応手順

### 🚨 サービス停止・障害時

#### GitHub停止時の代替手段

**バックアップ操作手順**
```bash
# 1. ローカルバックアップ作成
backup_local_work() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="backup_${timestamp}"
    
    mkdir -p "$backup_dir"
    cp -r .git "$backup_dir/"
    cp -r docs/ "$backup_dir/"
    tar -czf "${backup_dir}.tar.gz" "$backup_dir"
    
    echo "Backup created: ${backup_dir}.tar.gz"
}

# 2. 作業の継続（ローカル）
continue_offline() {
    echo "Working in offline mode..."
    git add .
    git commit -m "Offline work - $(date)"
    echo "Changes committed locally. Push when service recovers."
}
```

#### API制限到達時の対処

**手動代替操作**
```bash
# GitHub Project管理を手動実行
manual_project_update() {
    cat << EOF
Manual action required:
1. Open https://github.com/users/ks-source/projects/2
2. Click "Add item"
3. Select issue: $1
4. Set status: $2
EOF
}

# 制限解除まで待機
wait_for_rate_limit_reset() {
    local reset_time=$(gh api rate_limit | jq -r '.rate.reset')
    local current_time=$(date +%s)
    local wait_seconds=$((reset_time - current_time))
    
    if [ $wait_seconds -gt 0 ]; then
        echo "Waiting for rate limit reset: $wait_seconds seconds"
        echo "Reset time: $(date -d @$reset_time)"
        
        # 進捗表示つき待機
        while [ $wait_seconds -gt 0 ]; do
            printf "\rRemaining: %02d:%02d " $((wait_seconds/60)) $((wait_seconds%60))
            sleep 1
            wait_seconds=$((wait_seconds - 1))
        done
        echo ""
    fi
}
```

## 関連文書

- [環境依存リスク](environment-dependencies.md) - 実行環境問題
- [データ永続性リスク](data-persistence.md) - データ同期問題
- [緩和戦略集](mitigation-strategies.md) - 包括的対策

## 更新履歴

| 日付 | API制限・対処法 | 検証状況 |
|------|---------------|----------|
| 2025-08-14 | GitHub CLI認証スコープ問題 | 解決済み - 必要スコープ明確化 |
| 2025-08-14 | GitHub Projects API制限調査 | 基本操作確認済み |

---

**注意**: 新たなAPI制限や仕様変更を発見した場合は、このドキュメントに追記し、対処法の有効性を検証してください。