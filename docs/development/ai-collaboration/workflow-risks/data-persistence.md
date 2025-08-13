# データ永続性リスク

## 概要

AI駆動開発におけるデータの保存・取得・整合性に関する問題を記録し、データロスを防止するための対策を提供します。セッション間でのデータ喪失、同期処理の失敗、バックアップ・復旧手順を体系的に管理します。

## 主要リスク分類

### 💾 セッション間データ喪失

#### ClaudeCode実行環境の非永続性

**問題の特性**
```yaml
制約:
  - 各コマンド実行は独立したプロセス
  - 環境変数・作業ディレクトリが保持されない
  - 一時ファイル・メモリ状態の消失
  - バックグラウンドプロセスの終了

影響:
  - 中間生成ファイルの消失
  - 処理状態の追跡困難
  - 長時間処理の中断リスク
```

**対処戦略**
```bash
# 1. 永続的な場所への即座の保存
save_immediately() {
    local temp_file="$1"
    local permanent_file="$2"
    
    # 即座に永続的な場所に保存
    cp "$temp_file" "$permanent_file"
    echo "Saved to permanent location: $permanent_file"
}

# 2. 状態ファイルによる進捗管理
save_progress() {
    local step="$1"
    local state_file=".ai_progress"
    
    echo "$(date): $step" >> "$state_file"
    echo "Current step: $step" > ".current_step"
}

# 3. 定期的なチェックポイント作成
create_checkpoint() {
    local checkpoint_name="checkpoint_$(date +%Y%m%d_%H%M%S)"
    
    mkdir -p checkpoints
    tar -czf "checkpoints/${checkpoint_name}.tar.gz" \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='*.log' \
        .
    
    echo "Checkpoint created: $checkpoint_name"
}
```

#### 作業コンテキストの復元

**セッション再開時の状態確認**
```bash
#!/bin/bash
# session_restore.sh

restore_context() {
    echo "=== Session Restoration Check ==="
    
    # 1. 前回の作業ディレクトリ確認
    if [ -f ".current_working_dir" ]; then
        local last_dir=$(cat .current_working_dir)
        echo "Last working directory: $last_dir"
        cd "$last_dir" 2>/dev/null || echo "Warning: Cannot access $last_dir"
    fi
    
    # 2. 進行中タスクの確認
    if [ -f ".current_step" ]; then
        echo "Last completed step: $(cat .current_step)"
    fi
    
    # 3. 一時ファイル確認
    if [ -d "temp_work" ]; then
        echo "Temporary files found:"
        ls -la temp_work/
    fi
    
    # 4. Git状態確認
    if [ -d ".git" ]; then
        echo "Git status:"
        git status --porcelain
    fi
    
    # 5. 未完了作業の検出
    find . -name "*.tmp" -o -name "*.wip" -o -name "*.partial" 2>/dev/null | \
        head -5 | while read file; do
            echo "Incomplete work detected: $file"
        done
}

# 実行
restore_context
```

### 🔄 ファイル同期・整合性問題

#### Git操作における同期エラー

**典型的な問題パターン**
```yaml
マージコンフリクト:
  原因: 並行作業による変更競合
  影響: コミット・プッシュの失敗
  対処: 手動マージまたはファイル再生成

大容量ファイル問題:
  原因: Gitの制限を超えるファイルサイズ
  影響: プッシュ拒否、リポジトリ破損
  対処: Git LFS使用または外部ストレージ移行

ネットワーク中断:
  原因: 接続不安定によるプッシュ・プル失敗
  影響: データの部分的な同期
  対処: リトライ機構、チェックサム確認
```

**安全な同期手順**
```bash
# 1. プッシュ前の安全確認
safe_git_push() {
    echo "=== Pre-push Safety Check ==="
    
    # 大容量ファイル検出
    large_files=$(git ls-files | xargs ls -l 2>/dev/null | awk '$5 > 50*1024*1024 {print $9}')
    if [ -n "$large_files" ]; then
        echo "WARNING: Large files detected:"
        echo "$large_files"
        echo "Consider using Git LFS or external storage"
        return 1
    fi
    
    # リモート同期確認
    git fetch origin
    local behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
    if [ "$behind" -gt 0 ]; then
        echo "WARNING: Local branch is $behind commits behind remote"
        echo "Consider pulling latest changes first"
    fi
    
    # 実際のプッシュ
    git push "$@"
}

# 2. 中断耐性のあるファイル転送
robust_file_sync() {
    local source="$1"
    local dest="$2"
    local max_attempts=3
    
    for attempt in $(seq 1 $max_attempts); do
        echo "Sync attempt $attempt/$max_attempts"
        
        if rsync -avz --partial --progress "$source" "$dest"; then
            echo "Sync completed successfully"
            return 0
        else
            echo "Sync failed, retrying in 5 seconds..."
            sleep 5
        fi
    done
    
    echo "Sync failed after $max_attempts attempts"
    return 1
}
```

#### 外部ストレージとの同期問題

**S3・クラウドストレージ特有の問題**
```yaml
一貫性の問題:
  問題: Eventually Consistent な読み取り
  対処: 書き込み後の確認待機

権限・認証エラー:
  問題: 一時的な認証失効
  対処: リトライ機構、認証更新

ネットワーク分断:
  問題: 部分的なアップロード・ダウンロード
  対処: マルチパート、チェックサム確認
```

**AWS S3同期の堅牢な実装例**
```bash
# S3アップロードの冪等性確保
idempotent_s3_upload() {
    local file_path="$1"
    local s3_key="$2"
    local bucket="$3"
    
    # 1. ローカルファイルのハッシュ計算
    local local_hash=$(sha256sum "$file_path" | cut -d' ' -f1)
    
    # 2. S3上の既存ファイル確認
    local remote_hash=$(aws s3api head-object --bucket "$bucket" --key "$s3_key" \
        --query 'Metadata.sha256' --output text 2>/dev/null || echo "")
    
    # 3. ハッシュ比較でアップロード要否判定
    if [ "$local_hash" = "$remote_hash" ]; then
        echo "File already synchronized: $s3_key"
        return 0
    fi
    
    # 4. メタデータ付きアップロード
    aws s3 cp "$file_path" "s3://$bucket/$s3_key" \
        --metadata "sha256=$local_hash,upload-time=$(date -Iseconds)"
    
    # 5. アップロード確認
    sleep 2  # Eventually Consistent対応
    local uploaded_hash=$(aws s3api head-object --bucket "$bucket" --key "$s3_key" \
        --query 'Metadata.sha256' --output text)
    
    if [ "$local_hash" = "$uploaded_hash" ]; then
        echo "Upload verified: $s3_key"
        return 0
    else
        echo "Upload verification failed: $s3_key"
        return 1
    fi
}
```

### 🗃️ バックアップ・復旧計画

#### 段階的バックアップ戦略

**Three-Tier Backup System**
```yaml
Tier 1 - 即座のローカルバックアップ:
  頻度: 作業セッション終了時
  場所: ローカル ~/.ai-backup/
  保持期間: 7日間

Tier 2 - 日次リモートバックアップ:
  頻度: 日次自動実行
  場所: GitHub + 外部ストレージ
  保持期間: 30日間

Tier 3 - 週次アーカイブ:
  頻度: 週次実行
  場所: 長期保管ストレージ
  保持期間: 1年間
```

**自動バックアップスクリプト**
```bash
#!/bin/bash
# automated_backup.sh

# 設定
BACKUP_ROOT="$HOME/.ai-backup"
PROJECT_ROOT="/mnt/c/Users/ks/Documents/Github_clone/Code/HTML/Media-Viewer/v209"
MAX_LOCAL_BACKUPS=7

create_tiered_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="backup_${timestamp}"
    
    echo "=== Creating Tiered Backup: $backup_name ==="
    
    # Tier 1: ローカルバックアップ
    mkdir -p "$BACKUP_ROOT/tier1"
    local tier1_path="$BACKUP_ROOT/tier1/$backup_name"
    
    # 重要ファイルのみバックアップ（サイズ効率）
    tar -czf "${tier1_path}.tar.gz" \
        -C "$PROJECT_ROOT" \
        --exclude='.git/objects' \
        --exclude='node_modules' \
        --exclude='*.tmp' \
        --exclude='*.log' \
        .
    
    echo "Tier 1 backup created: ${tier1_path}.tar.gz"
    
    # 古いバックアップクリーンアップ
    cleanup_old_backups "$BACKUP_ROOT/tier1" "$MAX_LOCAL_BACKUPS"
    
    # Tier 2: Gitコミット・プッシュ
    if create_git_backup; then
        echo "Tier 2 backup completed (Git)"
    fi
    
    # Tier 3: 外部ストレージ（週次のみ）
    if [ "$(date +%u)" = "7" ]; then  # 日曜日
        if create_external_backup "$backup_name"; then
            echo "Tier 3 backup completed (External)"
        fi
    fi
}

cleanup_old_backups() {
    local backup_dir="$1"
    local max_count="$2"
    
    # 古いバックアップを削除（最新N個を保持）
    ls -t "$backup_dir"/*.tar.gz 2>/dev/null | tail -n +$((max_count + 1)) | \
        xargs rm -f 2>/dev/null || true
}

create_git_backup() {
    cd "$PROJECT_ROOT" || return 1
    
    # 変更があれば自動コミット
    if ! git diff-index --quiet HEAD 2>/dev/null; then
        git add .
        git commit -m "Auto-backup: $(date -Iseconds)" || return 1
        
        # リモートプッシュ（エラーでも継続）
        git push origin main 2>/dev/null || echo "Git push failed, continuing..."
    fi
    
    return 0
}

create_external_backup() {
    local backup_name="$1"
    
    # 例: S3アップロード（実装は将来のPhase 1で）
    # aws s3 cp "${BACKUP_ROOT}/tier1/${backup_name}.tar.gz" \
    #     "s3://ai-backup-bucket/weekly/${backup_name}.tar.gz"
    
    echo "External backup placeholder: $backup_name"
    return 0
}

# メイン実行
create_tiered_backup
```

#### 災害復旧手順

**Complete Recovery Procedure**
```bash
#!/bin/bash
# disaster_recovery.sh

disaster_recovery() {
    local recovery_point="$1"  # backup名またはgit commit hash
    
    echo "=== DISASTER RECOVERY INITIATED ==="
    echo "Recovery point: $recovery_point"
    
    # 1. 現在の状態をバックアップ（念のため）
    local emergency_backup="emergency_$(date +%Y%m%d_%H%M%S)"
    tar -czf "$HOME/${emergency_backup}.tar.gz" \
        -C "$PROJECT_ROOT" . 2>/dev/null || true
    
    # 2. 復旧方法の選択
    if [ -f "$BACKUP_ROOT/tier1/${recovery_point}.tar.gz" ]; then
        recover_from_local_backup "$recovery_point"
    elif git rev-parse --verify "$recovery_point" &>/dev/null; then
        recover_from_git "$recovery_point"
    else
        echo "ERROR: Recovery point not found: $recovery_point"
        list_available_recovery_points
        return 1
    fi
    
    echo "=== RECOVERY COMPLETED ==="
    echo "Emergency backup saved as: $emergency_backup.tar.gz"
}

recover_from_local_backup() {
    local backup_name="$1"
    local backup_file="$BACKUP_ROOT/tier1/${backup_name}.tar.gz"
    
    echo "Recovering from local backup: $backup_file"
    
    # 作業ディレクトリクリア・復元
    rm -rf "$PROJECT_ROOT"
    mkdir -p "$PROJECT_ROOT"
    tar -xzf "$backup_file" -C "$PROJECT_ROOT"
    
    echo "Local backup recovery completed"
}

recover_from_git() {
    local commit_hash="$1"
    
    echo "Recovering from Git commit: $commit_hash"
    
    cd "$PROJECT_ROOT" || return 1
    git reset --hard "$commit_hash"
    git clean -fd  # 未追跡ファイル削除
    
    echo "Git recovery completed"
}

list_available_recovery_points() {
    echo "Available recovery points:"
    
    echo "Local backups:"
    ls -t "$BACKUP_ROOT/tier1"/*.tar.gz 2>/dev/null | head -10 | \
        sed 's/.*backup_\([0-9_]*\).tar.gz/  \1/' || echo "  None found"
    
    echo "Recent Git commits:"
    cd "$PROJECT_ROOT" 2>/dev/null && \
        git log --oneline -10 | sed 's/^/  /' || echo "  Git not available"
}

# 使用例
# disaster_recovery "backup_20250814_150000"
# disaster_recovery "a1b2c3d"  # git commit hash
```

### 📊 データ整合性監視

#### 自動整合性チェック

**File Integrity Monitoring**
```bash
#!/bin/bash
# integrity_monitor.sh

# 重要ファイルの整合性チェック
check_file_integrity() {
    local checksum_file=".file_checksums"
    local current_checksums="/tmp/current_checksums"
    
    echo "=== File Integrity Check ==="
    
    # 重要ファイルのチェックサム計算
    find . -type f \
        -name "*.md" -o -name "*.json" -o -name "*.js" -o -name "*.ts" \
        ! -path "./.git/*" \
        ! -path "./node_modules/*" | \
        sort | xargs sha256sum > "$current_checksums" 2>/dev/null
    
    # 前回のチェックサムと比較
    if [ -f "$checksum_file" ]; then
        local changed_files=$(diff "$checksum_file" "$current_checksums" | grep "^>" | wc -l)
        local new_files=$(diff "$checksum_file" "$current_checksums" | grep "^<" | wc -l)
        
        echo "Files changed: $changed_files"
        echo "Files added: $new_files"
        
        if [ $changed_files -gt 0 ] || [ $new_files -gt 0 ]; then
            echo "Changes detected:"
            diff "$checksum_file" "$current_checksums" | head -20
        fi
    else
        echo "First integrity check - baseline created"
    fi
    
    # 新しいベースライン保存
    cp "$current_checksums" "$checksum_file"
    rm "$current_checksums"
}

# Git整合性チェック
check_git_integrity() {
    if [ -d ".git" ]; then
        echo "Git repository integrity:"
        
        # オブジェクト整合性
        if git fsck --no-progress 2>/dev/null; then
            echo "✓ Git objects integrity OK"
        else
            echo "✗ Git integrity issues detected"
        fi
        
        # リモート同期状態
        git fetch origin 2>/dev/null
        local ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
        local behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
        
        echo "Local commits ahead: $ahead"
        echo "Local commits behind: $behind"
    fi
}

# 実行
check_file_integrity
check_git_integrity
```

## データロス予防チェックリスト

### 🔍 セッション開始時

```bash
# セッション開始時のデータ安全確認
session_safety_check() {
    echo "=== Session Safety Check ==="
    
    # 1. 重要ファイルの存在確認
    local critical_files=(
        "docs/development/ai-collaboration/README.md"
        "package.json"
        ".gitignore"
    )
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            echo "✓ $file"
        else
            echo "✗ $file (MISSING)"
        fi
    done
    
    # 2. Git状態確認
    if git status &>/dev/null; then
        local uncommitted=$(git status --porcelain | wc -l)
        echo "Uncommitted changes: $uncommitted"
        
        if [ $uncommitted -gt 0 ]; then
            echo "WARNING: Uncommitted changes detected"
        fi
    fi
    
    # 3. 前回の作業継続確認
    if [ -f ".ai_session_state" ]; then
        echo "Previous session state found:"
        cat .ai_session_state
    fi
    
    # 4. ディスク容量確認
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    echo "Disk usage: ${disk_usage}%"
    
    if [ $disk_usage -gt 90 ]; then
        echo "WARNING: Low disk space"
    fi
}
```

### 📥 セッション終了時

```bash
# セッション終了時の安全な保存
session_cleanup() {
    echo "=== Session Cleanup ==="
    
    # 1. 作業状態の記録
    echo "Session ended: $(date)" > .ai_session_state
    git status --porcelain >> .ai_session_state 2>/dev/null || true
    
    # 2. 自動コミット（変更がある場合）
    if git status --porcelain | grep -q .; then
        git add .
        git commit -m "Auto-save: Session end $(date -Iseconds)" || \
            echo "Commit failed - changes preserved locally"
    fi
    
    # 3. バックアップ作成
    create_tiered_backup
    
    # 4. 一時ファイルクリーンアップ
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    
    echo "Session safely concluded"
}
```

## 関連文書

- [環境依存リスク](environment-dependencies.md) - 実行環境の制約
- [API制限・制約](api-limitations.md) - 外部サービス連携
- [緩和戦略集](mitigation-strategies.md) - 包括的対策

## 更新履歴

| 日付 | データ保護対策 | 検証状況 |
|------|-------------|----------|
| 2025-08-14 | 段階的バックアップシステム設計 | 設計完了 |
| 2025-08-14 | セッション状態管理機構 | 実装済み |

---

**注意**: データロスは開発効率に重大な影響を与えます。新たなデータ永続性リスクを発見した場合は、このドキュメントに追記し、予防策の実装を優先してください。