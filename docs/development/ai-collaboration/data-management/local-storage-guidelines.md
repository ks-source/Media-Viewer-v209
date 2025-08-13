# ローカルストレージガイドライン（暫定措置）

## 概要

S3等の外部ストレージが導入されるまでの暫定措置として、AIチャットログ・作業履歴・分析データをローカルディレクトリに効率的に保存・管理するためのガイドラインです。将来の外部ストレージ移行を見据えた構造化を重視します。

## 基本方針

### 🎯 暫定措置の目標
1. **即座の運用開始**: 複雑なセットアップなしで今すぐ使える
2. **移行容易性**: 将来のS3移行時にスムーズに転送可能
3. **検索性確保**: ローカルでも効率的なデータ検索・分析
4. **セキュリティ**: 機密情報の適切な管理・マスキング

### ⚖️ 設計原則
- **構造化**: 明確なディレクトリ・ファイル命名規則
- **メタデータ**: 検索・分析用の構造化情報付与
- **自動化**: 手動作業を最小化する仕組み
- **互換性**: 複数OS・環境での一貫した動作

## ディレクトリ構造

### 📁 標準ディレクトリレイアウト

```
~/ai-development-data/              # ルートディレクトリ
├── config/                         # 設定・初期化用
│   ├── storage-config.yaml         # 保存設定
│   ├── classification-rules.yaml   # 自動分類ルール
│   └── security-policy.yaml        # セキュリティ設定
├── active-sessions/                # 現在進行中のセッション
│   ├── 2025-08-13/                # 日付ベースディレクトリ
│   │   ├── session-143022-github-setup/
│   │   └── session-160845-data-management/
│   └── current -> 2025-08-13/     # 現在日へのシンボリックリンク
├── completed-sessions/             # 完了済みセッション
│   ├── 2025-08/                   # 月単位アーカイブ
│   │   ├── 13/                    # 日別
│   │   ├── 14/
│   │   └── summary.md             # 月次サマリー
│   └── archive/                   # 長期アーカイブ
├── working-files/                  # 作業用一時ファイル
│   ├── drafts/                    # ドラフト・草稿
│   ├── templates/                 # テンプレート集
│   ├── scratch/                   # スクラッチエリア
│   └── imports/                   # 外部からの取り込み
├── analysis-results/               # 分析・レポート結果
│   ├── capability-analysis/       # 機能分析結果
│   ├── performance-metrics/       # パフォーマンス測定
│   ├── decision-logs/             # 意思決定分析
│   └── trends/                    # トレンド分析
├── exported-data/                  # 外部送信用データ
│   ├── github-summaries/          # GitHub用要約
│   ├── s3-ready/                  # S3移行準備済み
│   └── backups/                   # バックアップ
├── indexes/                        # 検索・インデックス用
│   ├── metadata.json              # 全データのメタデータ
│   ├── search-index.json          # 検索インデックス
│   ├── tags.json                  # タグ・分類情報
│   └── relationships.json         # データ間の関連性
└── .security/                      # セキュリティ関連
    ├── .gitignore                 # Git除外設定
    ├── .secrets-patterns          # 機密パターン定義
    └── access-log.json            # アクセスログ
```

### 🏷️ ファイル命名規則

#### セッションファイル
```
命名パターン:
session-YYYYMMDD-HHMMSS-[keyword1-keyword2].[ext]

例:
session-20250813-143022-github-projects.md    # メインチャット
session-20250813-143022-github-projects.json  # 構造化データ
session-20250813-143022-github-projects.meta  # メタデータ

keyword選択基準:
- プロジェクト名: github, ai-collaboration, data-management
- 機能分類: setup, implementation, testing, documentation
- 技術分野: cli, api, storage, security
```

#### 分析・結果ファイル
```
命名パターン:
[type]-YYYYMMDD-[target]-[scope].[ext]

例:
analysis-20250813-github-capabilities-full.json
report-20250813-storage-policy-summary.md  
metrics-20250813-performance-weekly.csv
decision-20250813-storage-strategy-final.md
```

#### テンプレート・設定ファイル
```
命名パターン:
[category]-[purpose]-template.[ext]
[system]-config.[ext]

例:
session-summary-template.md
issue-description-template.md
storage-config.yaml
security-policy.yaml
```

## ファイル形式・構造

### 📝 チャットログ形式

#### Markdownフォーマット（主要）
```markdown
# AIセッション記録

## メタデータ
- **セッションID**: session-20250813-143022-github-projects
- **開始時刻**: 2025-08-13 14:30:22 JST
- **終了時刻**: 2025-08-13 16:08:45 JST  
- **AI**: ClaudeCode (claude-sonnet-4-20250514)
- **ユーザー**: ks-source
- **プロジェクト**: Media-Viewer-v209
- **カテゴリ**: ["github", "cli", "setup"]
- **優先度**: high
- **ステータス**: completed

## サマリー
GitHub CLIのインストールとプロジェクト管理機能の検証を実施。
主な成果: CLI認証成功、プロジェクト作成・Issue管理の自動化確立。

### 主要成果物
- [x] GitHub CLI v2.46.0インストール完了
- [x] プロジェクト「Media Viewer v209 Roadmap」作成
- [x] 3つのIssueを自動作成・プロジェクト追加
- [x] 機能検証マトリックス更新

### 技術的決定
1. **採用**: バイナリ直接インストール方式
   - 理由: WSL環境でのsudo権限制約回避
   - 代替案: パッケージマネージャー（権限不足で断念）

2. **採用**: 2段階Issue管理（作成→プロジェクト追加）
   - 理由: 直接指定時のプロジェクト番号認識問題
   - 代替案: 1段階処理（技術制約で不可）

## 詳細会話ログ

### [14:30:22] 人間
GitHub CLIをインストールして使える状態にしてください。

### [14:30:35] ClaudeCode  
GitHub CLIのインストールを進めます。WSL環境での最適な方法を検討します...

[詳細な会話ログが続く...]

## 生成ファイル・コマンド履歴

### 実行コマンド
```bash
# インストール
wget https://github.com/cli/cli/releases/download/v2.46.0/gh_2.46.0_linux_amd64.tar.gz
tar -xzf /tmp/gh.tar.gz -C /tmp
cp /tmp/gh_2.46.0_linux_amd64/bin/gh ~/.local/bin/

# 認証・設定
gh auth login
gh project create --owner ks-source --title "Media Viewer v209 Development Roadmap"

# Issue管理
gh issue create --repo ks-source/Media-Viewer-v209 --title "拡張子統合実装" 
gh project item-add 2 --owner ks-source --url [issue-url]
```

### 生成ファイル
- `/home/ks/.local/bin/gh` (実行ファイル)
- `docs/development/ai-collaboration/github-integration-capabilities.md` (文書)

## セキュリティ・機密情報
**注意**: 以下の情報は自動マスキング済み
- GitHub Token: `ghp_************************************`
- リポジトリURL: `https://github.com/ks-source/[REPO]`

## 次回アクション・フォローアップ
- [ ] データ管理ガイドライン完成後の統合テスト
- [ ] 外部ストレージ移行計画の具体化  
- [ ] 定期レポート自動生成の検討

## 関連セッション・参照
- 前回: `session-20250812-github-sync-recovery`
- 次回予定: `session-20250814-extension-integration`
- 関連Issue: #1, #2, #3 (Media-Viewer-v209)
```

#### JSON構造化データ（補完用）
```json
{
  "session": {
    "id": "session-20250813-143022-github-projects",
    "timestamp": {
      "start": "2025-08-13T14:30:22+09:00",
      "end": "2025-08-13T16:08:45+09:00",
      "duration_minutes": 98
    },
    "participants": {
      "ai": {
        "model": "claude-sonnet-4-20250514",
        "version": "ClaudeCode",
        "capabilities": ["bash", "file-operations", "github-cli"]
      },
      "human": {
        "user": "ks-source",
        "role": "developer",
        "expertise": ["javascript", "project-management"]
      }
    },
    "context": {
      "project": "Media-Viewer-v209",
      "repository": "ks-source/Media-Viewer-v209",
      "branch": "main",
      "working_directory": "/mnt/c/Users/ks/Documents/Github_clone/Code/HTML/Media-Viewer/v209"
    },
    "categories": ["github", "cli", "setup", "project-management"],
    "priority": "high",
    "status": "completed",
    "quality_score": 95
  },
  "outcomes": {
    "deliverables": [
      {
        "type": "software",
        "name": "GitHub CLI",
        "version": "2.46.0",
        "location": "/home/ks/.local/bin/gh",
        "status": "installed"
      },
      {
        "type": "project",
        "name": "Media Viewer v209 Roadmap",
        "platform": "GitHub Projects",
        "url": "https://github.com/users/ks-source/projects/2",
        "status": "active"
      },
      {
        "type": "document",
        "name": "GitHub Integration Capabilities Matrix",
        "location": "docs/development/ai-collaboration/github-integration-capabilities.md",
        "status": "completed"
      }
    ],
    "decisions": [
      {
        "id": "install-method",
        "question": "GitHub CLIインストール方法の選択",
        "options": [
          {
            "name": "package-manager",
            "pros": ["簡単", "自動更新"],
            "cons": ["sudo権限必要", "WSL制約"]
          },
          {
            "name": "binary-direct", 
            "pros": ["権限不要", "確実"],
            "cons": ["手動更新", "パス設定必要"]
          }
        ],
        "decision": "binary-direct",
        "rationale": "WSL環境でのsudo権限制約を回避",
        "timestamp": "2025-08-13T14:45:00+09:00"
      }
    ],
    "metrics": {
      "commands_executed": 12,
      "files_created": 6,
      "files_modified": 2,
      "github_api_calls": 8,
      "success_rate": 1.0,
      "error_count": 3,
      "error_types": ["permission", "command-not-found", "api-limit"]
    }
  },
  "tools_used": [
    {
      "name": "Bash",
      "usage_count": 15,
      "success_rate": 0.93,
      "primary_operations": ["download", "extract", "install", "configure"]
    },
    {
      "name": "GitHub CLI",
      "usage_count": 8,
      "success_rate": 1.0,
      "primary_operations": ["auth", "project", "issue", "repo"]
    }
  ],
  "knowledge_gained": [
    {
      "topic": "github-cli-wsl-installation",
      "confidence": "high",
      "applicable_contexts": ["wsl", "ubuntu", "github"]
    },
    {
      "topic": "github-projects-cli-integration",
      "confidence": "medium",
      "limitations": ["status-field-updates", "custom-fields"]
    }
  ]
}
```

### 📊 メタデータファイル形式

#### セッションメタデータ（.meta）
```yaml
# session-20250813-143022-github-projects.meta
session:
  id: session-20250813-143022-github-projects
  start_time: '2025-08-13T14:30:22+09:00'
  end_time: '2025-08-13T16:08:45+09:00'
  duration_minutes: 98
  
participants:
  ai:
    model: claude-sonnet-4-20250514
    capabilities: [bash, file-operations, github-cli]
  human:
    user: ks-source
    role: developer

classification:
  primary_category: project-management
  tags: [github, cli, setup, automation]
  priority: high
  complexity: medium
  
outcomes:
  status: completed
  success_rate: 0.95
  deliverables_count: 6
  decisions_count: 2
  
quality:
  completeness: 0.95
  accuracy: 0.98
  usefulness: 0.92
  
security:
  contains_secrets: true
  masking_applied: true
  access_level: internal
  
relationships:
  predecessor: session-20250812-github-sync-recovery
  successor: session-20250814-extension-integration
  related_issues: ['#1', '#2', '#3']
  related_documents: 
    - github-integration-capabilities.md
    - project-management-workflow.md
```

## 自動化・スクリプト

### 🤖 セッション管理スクリプト

#### セッション開始スクリプト
```bash
#!/bin/bash
# ai-session-start.sh

# 設定
AI_DATA_ROOT="$HOME/ai-development-data"
TODAY=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# 引数処理
TOPIC=${1:-"general"}
KEYWORDS=${2:-"development"}

# ディレクトリ作成
SESSION_DIR="$AI_DATA_ROOT/active-sessions/$TODAY/session-$TIMESTAMP-$TOPIC"
mkdir -p "$SESSION_DIR"

# セッション初期化
SESSION_ID="session-$TIMESTAMP-$TOPIC"
cat > "$SESSION_DIR/session.md" << EOF
# AIセッション記録

## メタデータ
- **セッションID**: $SESSION_ID  
- **開始時刻**: $(date '+%Y-%m-%d %H:%M:%S %Z')
- **AI**: ClaudeCode
- **ユーザー**: $(whoami)
- **カテゴリ**: ["$KEYWORDS"]
- **ステータス**: active

## サマリー
[進行中...]

## 詳細会話ログ

### [$(date '+%H:%M:%S')] セッション開始
EOF

# メタデータ作成
cat > "$SESSION_DIR/session.meta" << EOF
session:
  id: $SESSION_ID
  start_time: '$(date -Iseconds)'
  status: active
  
participants:
  ai:
    model: claude-sonnet-4-20250514
  human:
    user: $(whoami)
    
classification:
  tags: [$KEYWORDS]
  priority: medium
EOF

# 現在リンク更新
ln -sfn "$TODAY" "$AI_DATA_ROOT/active-sessions/current"

echo "Session started: $SESSION_ID"
echo "Directory: $SESSION_DIR"
```

#### セッション完了スクリプト  
```bash
#!/bin/bash
# ai-session-complete.sh

SESSION_ID=${1:-"latest"}
AI_DATA_ROOT="$HOME/ai-development-data"

if [ "$SESSION_ID" = "latest" ]; then
    SESSION_DIR=$(find "$AI_DATA_ROOT/active-sessions" -name "session-*" -type d | sort | tail -1)
else
    SESSION_DIR=$(find "$AI_DATA_ROOT/active-sessions" -name "*$SESSION_ID*" -type d | head -1)
fi

if [ ! -d "$SESSION_DIR" ]; then
    echo "Error: Session not found"
    exit 1
fi

# 完了時刻を記録
END_TIME=$(date -Iseconds)
sed -i "s/ステータス**: active/ステータス**: completed/" "$SESSION_DIR/session.md"
echo "- **終了時刻**: $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$SESSION_DIR/session.md"

# メタデータ更新
yq eval ".session.end_time = \"$END_TIME\"" -i "$SESSION_DIR/session.meta"
yq eval ".session.status = \"completed\"" -i "$SESSION_DIR/session.meta"

# アーカイブ移動
MONTH=$(date +%Y-%m)
DAY=$(date +%d)
ARCHIVE_DIR="$AI_DATA_ROOT/completed-sessions/$MONTH/$DAY"
mkdir -p "$ARCHIVE_DIR"

mv "$SESSION_DIR" "$ARCHIVE_DIR/"

# インデックス更新
"$AI_DATA_ROOT/scripts/update-index.sh"

echo "Session completed and archived: $SESSION_ID"
```

### 🔍 検索・分析スクリプト

#### セッション検索
```bash
#!/bin/bash
# ai-session-search.sh

AI_DATA_ROOT="$HOME/ai-development-data"
QUERY="$1"
CATEGORY="$2"

# テキスト検索
if [ -n "$QUERY" ]; then
    echo "=== Text Search: $QUERY ==="
    grep -r "$QUERY" "$AI_DATA_ROOT" \
        --include="*.md" --include="*.json" \
        -l | head -10
fi

# カテゴリ検索  
if [ -n "$CATEGORY" ]; then
    echo "=== Category Search: $CATEGORY ==="
    find "$AI_DATA_ROOT" -name "*.meta" -exec grep -l "$CATEGORY" {} \; \
        | sed 's/.meta$//' | head -10
fi

# 最近のセッション
echo "=== Recent Sessions ==="
find "$AI_DATA_ROOT/completed-sessions" -name "session-*" -type d \
    | sort -r | head -5
```

#### データ分析・レポート生成
```bash
#!/bin/bash
# ai-generate-report.sh

AI_DATA_ROOT="$HOME/ai-development-data"
PERIOD=${1:-"week"}  # day, week, month
OUTPUT_DIR="$AI_DATA_ROOT/analysis-results/reports"

mkdir -p "$OUTPUT_DIR"

case $PERIOD in
    "day")
        DATE=$(date +%Y-%m-%d)
        SESSIONS=$(find "$AI_DATA_ROOT" -name "*$DATE*" -type d)
        ;;
    "week")
        START_DATE=$(date -d '7 days ago' +%Y-%m-%d)
        SESSIONS=$(find "$AI_DATA_ROOT" -newer "$AI_DATA_ROOT/completed-sessions/.timestamp-$START_DATE" -name "session-*" -type d 2>/dev/null)
        ;;
    "month")
        MONTH=$(date +%Y-%m)
        SESSIONS=$(find "$AI_DATA_ROOT/completed-sessions/$MONTH" -name "session-*" -type d 2>/dev/null)
        ;;
esac

# レポート生成
REPORT_FILE="$OUTPUT_DIR/report-$(date +%Y%m%d)-$PERIOD.md"

cat > "$REPORT_FILE" << EOF
# AI開発活動レポート ($PERIOD)

**生成日時**: $(date '+%Y-%m-%d %H:%M:%S')
**対象期間**: $PERIOD  
**セッション数**: $(echo "$SESSIONS" | wc -l)

## セッション一覧
EOF

for session in $SESSIONS; do
    if [ -f "$session/session.meta" ]; then
        SESSION_ID=$(basename "$session")
        CATEGORY=$(yq eval '.classification.tags[0]' "$session/session.meta" 2>/dev/null || echo "unknown")
        STATUS=$(yq eval '.session.status' "$session/session.meta" 2>/dev/null || echo "unknown")
        echo "- [$SESSION_ID]($session) - $CATEGORY ($STATUS)" >> "$REPORT_FILE"
    fi
done

cat >> "$REPORT_FILE" << EOF

## 統計サマリー
- 完了セッション: $(find "$AI_DATA_ROOT" -name "*.meta" -exec grep -l "completed" {} \; | wc -l)
- 進行中セッション: $(find "$AI_DATA_ROOT" -name "*.meta" -exec grep -l "active" {} \; | wc -l)
- 主要カテゴリ: $(find "$AI_DATA_ROOT" -name "*.meta" -exec yq eval '.classification.tags[0]' {} \; 2>/dev/null | sort | uniq -c | sort -nr | head -3)

## 推奨アクション
[自動分析結果を挿入]
EOF

echo "Report generated: $REPORT_FILE"
```

## セキュリティ・機密情報管理

### 🔒 自動マスキング

#### 機密パターン定義
```yaml
# .security/.secrets-patterns
patterns:
  github_token:
    regex: 'gh[po]_[A-Za-z0-9]{36}'
    replacement: 'ghp_************************************'
    severity: critical
    
  api_key:
    regex: '[Aa][Pp][Ii]_?[Kk][Ee][Yy][\s=:]+[A-Za-z0-9\-_]{20,}'
    replacement: 'API_KEY_***MASKED***'
    severity: high
    
  email:
    regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    replacement: '***@***.***'
    severity: medium
    
  url_with_auth:
    regex: 'https://[^:]+:[^@]+@[^\s]+'
    replacement: 'https://***:***@***'
    severity: high
    
  file_path:
    regex: '/Users/[^/]+/'
    replacement: '/Users/***/'''
    severity: low
```

#### 自動マスキングスクリプト
```bash
#!/bin/bash
# ai-mask-secrets.sh

AI_DATA_ROOT="$HOME/ai-development-data"
PATTERNS_FILE="$AI_DATA_ROOT/.security/.secrets-patterns"
TARGET_FILE="$1"

if [ ! -f "$TARGET_FILE" ]; then
    echo "Error: Target file not found"
    exit 1
fi

# バックアップ作成
cp "$TARGET_FILE" "$TARGET_FILE.backup"

# パターンファイル読み込み・マスキング実行
while IFS= read -r line; do
    if [[ $line =~ regex:\ \'(.+)\' ]]; then
        PATTERN="${BASH_REMATCH[1]}"
    elif [[ $line =~ replacement:\ \'(.+)\' ]]; then
        REPLACEMENT="${BASH_REMATCH[1]}"
        # 置換実行
        sed -i.tmp "s/${PATTERN}/${REPLACEMENT}/g" "$TARGET_FILE"
    fi
done < <(yq eval '.patterns[] | "regex: \(.regex)", "replacement: \(.replacement)"' "$PATTERNS_FILE")

# 一時ファイル削除
rm -f "$TARGET_FILE.tmp"

echo "Secrets masked in: $TARGET_FILE"
```

### 🛡️ アクセス制御

#### アクセスログ記録
```bash
#!/bin/bash
# ai-log-access.sh

AI_DATA_ROOT="$HOME/ai-development-data" 
LOG_FILE="$AI_DATA_ROOT/.security/access-log.json"
ACTION="$1"  # read, write, delete, export
TARGET="$2"  # ファイルパス
USER=$(whoami)
TIMESTAMP=$(date -Iseconds)

# ログエントリ作成
LOG_ENTRY=$(jq -n \
  --arg timestamp "$TIMESTAMP" \
  --arg user "$USER" \
  --arg action "$ACTION" \
  --arg target "$TARGET" \
  --arg ip "$(hostname -I | awk '{print $1}')" \
  '{
    timestamp: $timestamp,
    user: $user,
    action: $action,
    target: $target,
    source_ip: $ip,
    success: true
  }')

# ログファイルに追記
if [ ! -f "$LOG_FILE" ]; then
    echo "[]" > "$LOG_FILE"
fi

jq ". += [$LOG_ENTRY]" "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
```

## 検索・インデックス管理

### 📇 メタデータインデックス

#### 全データインデックス更新
```bash
#!/bin/bash
# update-index.sh

AI_DATA_ROOT="$HOME/ai-development-data"
INDEX_FILE="$AI_DATA_ROOT/indexes/metadata.json"
TEMP_INDEX="$INDEX_FILE.tmp"

echo "Updating metadata index..."

# 基本構造初期化
cat > "$TEMP_INDEX" << EOF
{
  "last_updated": "$(date -Iseconds)",
  "total_sessions": 0,
  "total_size_mb": 0,
  "sessions": [],
  "categories": {},
  "tags": {},
  "statistics": {}
}
EOF

# セッションディレクトリ検索・インデックス化
find "$AI_DATA_ROOT" -name "session-*" -type d | while read -r session_dir; do
    if [ -f "$session_dir/session.meta" ]; then
        SESSION_ID=$(basename "$session_dir")
        
        # メタデータ読み込み
        META_DATA=$(cat "$session_dir/session.meta")
        
        # ファイルサイズ計算
        SIZE_MB=$(du -sm "$session_dir" | cut -f1)
        
        # インデックスエントリ作成
        ENTRY=$(jq -n \
          --arg id "$SESSION_ID" \
          --arg path "$session_dir" \
          --arg size "$SIZE_MB" \
          --argjson meta "$(echo "$META_DATA" | yq eval -o=json '.')" \
          '{
            id: $id,
            path: $path,
            size_mb: ($size | tonumber),
            metadata: $meta
          }')
        
        # インデックスに追加
        jq ".sessions += [$ENTRY]" "$TEMP_INDEX" > "$TEMP_INDEX.2" && mv "$TEMP_INDEX.2" "$TEMP_INDEX"
    fi
done

# 統計情報計算
jq '
  .total_sessions = (.sessions | length) |
  .total_size_mb = (.sessions | map(.size_mb) | add) |
  .categories = (.sessions | group_by(.metadata.classification.primary_category) | 
                 map({key: .[0].metadata.classification.primary_category, value: length}) | 
                 from_entries) |
  .statistics.avg_session_size = (if .total_sessions > 0 then (.total_size_mb / .total_sessions) else 0 end)
' "$TEMP_INDEX" > "$INDEX_FILE"

rm -f "$TEMP_INDEX"*
echo "Index updated: $INDEX_FILE"
```

### 🔍 高速検索機能

#### フルテキスト検索
```bash
#!/bin/bash
# ai-search.sh

AI_DATA_ROOT="$HOME/ai-development-data"
INDEX_FILE="$AI_DATA_ROOT/indexes/metadata.json"

QUERY="$1"
CATEGORY="$2"
DATE_FROM="$3"
DATE_TO="$4"

if [ ! -f "$INDEX_FILE" ]; then
    echo "Error: Search index not found. Run update-index.sh first."
    exit 1
fi

# クエリ条件構築
JQ_FILTER=".sessions[]"

if [ -n "$CATEGORY" ]; then
    JQ_FILTER="$JQ_FILTER | select(.metadata.classification.primary_category == \"$CATEGORY\")"
fi

if [ -n "$DATE_FROM" ]; then
    JQ_FILTER="$JQ_FILTER | select(.metadata.session.start_time >= \"$DATE_FROM\")"
fi

if [ -n "$DATE_TO" ]; then
    JQ_FILTER="$JQ_FILTER | select(.metadata.session.start_time <= \"$DATE_TO\")"
fi

# インデックス検索実行
CANDIDATES=$(jq -r "$JQ_FILTER | .path" "$INDEX_FILE" 2>/dev/null)

if [ -n "$QUERY" ]; then
    # テキスト検索
    echo "=== Search Results for: '$QUERY' ==="
    for session_path in $CANDIDATES; do
        if grep -q "$QUERY" "$session_path/session.md" 2>/dev/null; then
            SESSION_ID=$(basename "$session_path")
            CATEGORY=$(jq -r ".sessions[] | select(.path == \"$session_path\") | .metadata.classification.primary_category" "$INDEX_FILE")
            echo "[$SESSION_ID] $CATEGORY - $session_path"
        fi
    done
else
    # カテゴリ・日付検索のみ
    echo "=== Filtered Sessions ==="
    for session_path in $CANDIDATES; do
        SESSION_ID=$(basename "$session_path")
        echo "$SESSION_ID - $session_path"
    done
fi
```

## 外部ストレージ移行準備

### 📦 S3移行準備スクリプト

```bash
#!/bin/bash
# prepare-s3-migration.sh

AI_DATA_ROOT="$HOME/ai-development-data"
S3_READY_DIR="$AI_DATA_ROOT/exported-data/s3-ready"

mkdir -p "$S3_READY_DIR"

# 移行対象セッション選択（例：30日以前のcompletedセッション）
CUTOFF_DATE=$(date -d '30 days ago' +%Y-%m-%d)

find "$AI_DATA_ROOT/completed-sessions" -name "session-*" -type d | while read -r session_dir; do
    SESSION_META="$session_dir/session.meta"
    
    if [ -f "$SESSION_META" ]; then
        START_TIME=$(yq eval '.session.start_time' "$SESSION_META")
        SESSION_DATE=$(echo "$START_TIME" | cut -d'T' -f1)
        
        if [[ "$SESSION_DATE" < "$CUTOFF_DATE" ]]; then
            SESSION_ID=$(basename "$session_dir")
            
            # S3移行用パッケージ作成
            PACKAGE_DIR="$S3_READY_DIR/$SESSION_ID"
            mkdir -p "$PACKAGE_DIR"
            
            # セッションデータコピー
            cp -r "$session_dir"/* "$PACKAGE_DIR/"
            
            # S3メタデータ追加
            cat > "$PACKAGE_DIR/s3-metadata.json" << EOF
{
  "migration": {
    "prepared_at": "$(date -Iseconds)",
    "source_path": "$session_dir",
    "s3_key_prefix": "ai-sessions/$SESSION_ID/",
    "compression": "gzip",
    "retention_policy": "standard"
  },
  "original_metadata": $(cat "$SESSION_META" | yq eval -o=json '.')
}
EOF
            
            # 圧縮
            cd "$S3_READY_DIR"
            tar -czf "${SESSION_ID}.tar.gz" "$SESSION_ID"
            rm -rf "$SESSION_ID"
            
            echo "Prepared for S3: $SESSION_ID"
        fi
    fi
done

echo "S3 migration packages ready in: $S3_READY_DIR"
```

## 運用・保守

### 🔧 日次・週次メンテナンス

#### 自動化クリーンアップ
```bash
#!/bin/bash
# ai-maintenance.sh

AI_DATA_ROOT="$HOME/ai-development-data"

echo "=== AI Data Maintenance $(date) ==="

# 1. 古い一時ファイルクリーンアップ
find "$AI_DATA_ROOT/working-files/scratch" -mtime +7 -delete
echo "Cleaned temporary files older than 7 days"

# 2. インデックス更新
"$AI_DATA_ROOT/scripts/update-index.sh"

# 3. ディスク使用量確認
TOTAL_SIZE=$(du -sh "$AI_DATA_ROOT" | cut -f1)
echo "Total storage usage: $TOTAL_SIZE"

# 4. アクセスログローテーション
ACCESS_LOG="$AI_DATA_ROOT/.security/access-log.json"
if [ -f "$ACCESS_LOG" ] && [ $(stat -f%z "$ACCESS_LOG" 2>/dev/null || stat -c%s "$ACCESS_LOG" 2>/dev/null) -gt 10485760 ]; then
    mv "$ACCESS_LOG" "$ACCESS_LOG.$(date +%Y%m%d)"
    echo "[]" > "$ACCESS_LOG"
    echo "Rotated access log"
fi

# 5. セキュリティスキャン
find "$AI_DATA_ROOT" -name "*.md" -o -name "*.json" | head -100 | while read -r file; do
    if grep -qE "(ghp_|sk-|pk_)" "$file" 2>/dev/null; then
        echo "WARNING: Potential secret found in $file"
    fi
done

echo "Maintenance completed"
```

### 📊 レポート・分析

#### 月次サマリーレポート生成
```bash
#!/bin/bash
# monthly-summary.sh

AI_DATA_ROOT="$HOME/ai-development-data"
MONTH=$(date +%Y-%m)
REPORT_DIR="$AI_DATA_ROOT/analysis-results/monthly-reports"
REPORT_FILE="$REPORT_DIR/summary-$MONTH.md"

mkdir -p "$REPORT_DIR"

# レポート生成
cat > "$REPORT_FILE" << EOF
# AI開発活動月次サマリー ($MONTH)

**生成日時**: $(date '+%Y-%m-%d %H:%M:%S')

## 基本統計

### セッション数
- 今月完了: $(find "$AI_DATA_ROOT/completed-sessions/$MONTH" -name "session-*" -type d 2>/dev/null | wc -l)
- 平均セッション時間: [計算中]
- 最も活発な日: [分析中]

### データ使用量
- 今月生成データ: $(du -sh "$AI_DATA_ROOT/completed-sessions/$MONTH" 2>/dev/null | cut -f1 || echo "0B")
- 累計データ: $(du -sh "$AI_DATA_ROOT" | cut -f1)

### 主要カテゴリ
EOF

# カテゴリ別統計追加
find "$AI_DATA_ROOT/completed-sessions/$MONTH" -name "*.meta" -exec yq eval '.classification.primary_category' {} \; 2>/dev/null | \
    sort | uniq -c | sort -nr | head -5 | while read -r count category; do
    echo "- $category: $count sessions" >> "$REPORT_FILE"
done

cat >> "$REPORT_FILE" << EOF

## 主要成果
[手動で重要な成果を記入]

## 課題・改善点
[手動で課題を記入]

## 次月計画
[手動で計画を記入]
EOF

echo "Monthly summary generated: $REPORT_FILE"
```

## トラブルシューティング

### 🚨 よくある問題と対処法

```bash
# ディスク容量不足
df -h "$HOME/ai-development-data"
# 対処: 古いセッションのアーカイブ・削除

# インデックス破損
rm "$HOME/ai-development-data/indexes/metadata.json"
"$HOME/ai-development-data/scripts/update-index.sh"

# 権限問題
chmod -R u+rw "$HOME/ai-development-data"
find "$HOME/ai-development-data" -type d -exec chmod u+x {} \;

# 検索結果が見つからない
# 原因: インデックス未更新またはファイル移動
"$HOME/ai-development-data/scripts/update-index.sh"
```

---

**注意**: このローカルストレージガイドラインは暫定措置であり、S3等の外部ストレージが導入され次第、段階的に移行されます。運用中に発見した課題や改善点は随時このガイドラインに反映してください。