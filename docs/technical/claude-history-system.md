# ClaudeCode履歴管理システム技術仕様 - v209

## システムアーキテクチャ

### 全体構成
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ClaudeCode    │───▶│  同期スクリプト  │───▶│  履歴ストレージ │
│   (ソース)      │    │  (Python 3.8+)  │    │  (ローカル)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        ▼
        │                        │               ┌─────────────────┐
        │                        │               │  処理済みデータ │
        │                        │               │  (Markdown)     │
        │                        │               └─────────────────┘
        │                        │
        │                        ▼
        │               ┌──────────────────┐
        │               │   同期ログ       │
        │               │   (管理情報)     │
        │               └──────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Git管理除外領域                                 │
│  (.gitignoreによる大容量ファイル対策)                               │
└─────────────────────────────────────────────────────────────────────┘
```

## データフロー

### 1. 同期処理フロー
```python
def sync_process():
    # 1. ソースディレクトリ検索
    source_files = discover_claude_history()
    
    # 2. 新規/更新ファイル特定
    new_files = filter_new_files(source_files)
    
    # 3. バックアップ作成
    for file in new_files:
        backup_to_native(file)
        
    # 4. フォーマット変換
    for file in new_files:
        convert_to_markdown(file)
        
    # 5. ログ生成
    generate_sync_log(results)
```

### 2. ファイル処理パイプライン
```
JSONL入力 ─┐
           ├─▶ 構文解析 ─▶ データ抽出 ─▶ Markdown変換 ─▶ 出力
           │
           └─▶ 原本保存 ─────────────────────────────────▶ native/
```

## データ構造仕様

### JSONL形式（native）
```json
{
  "id": "uuid-string",
  "timestamp": "2025-08-11T20:17:45.171Z",
  "session_id": "session-uuid",
  "role": "user|assistant",
  "content": "会話内容",
  "metadata": {
    "version": "v209",
    "model": "claude-sonnet-4",
    "tokens": 1234
  }
}
```

### Markdown形式（processed）
```markdown
# Claude Session: v209-session-id

## メタデータ
- **セッションID**: v209-80ab5fc0-19c0-4393-919b-15939a372e55
- **作成日時**: 2025-08-11T20:17:45.171Z
- **モデル**: claude-sonnet-4
- **総トークン数**: 15,432

## 会話履歴

### [20:17:45] User
初期質問内容...

### [20:18:12] Assistant  
回答内容...
```

### 同期ログ形式（sync）
```markdown
# ClaudeCode履歴同期ログ

## 同期実行情報
- **実行日時**: 2025-08-11T20:17:45.171Z
- **処理ファイル数**: 58
- **成功**: 26 (44.8%)
- **失敗**: 32
- **新規追加**: 5

## 詳細結果
| ファイル名 | サイズ | 状態 | 備考 |
|-----------|--------|------|------|
| v209-80ab... | 15.2MB | 成功 | - |
| v208-72cc... | 72.5MB | 警告 | サイズ大 |
```

## API仕様

### 内部関数

#### `discover_claude_history()`
```python
def discover_claude_history(search_paths=None):
    """
    ClaudeCode履歴ファイルを検索
    
    Args:
        search_paths (list): 検索パスリスト
        
    Returns:
        list: 検出されたファイルパスリスト
        
    Raises:
        FileNotFoundError: ディレクトリが見つからない場合
    """
```

#### `convert_to_markdown(jsonl_path, output_path)`
```python
def convert_to_markdown(jsonl_path, output_path):
    """
    JSONLファイルをMarkdownに変換
    
    Args:
        jsonl_path (Path): 入力JSONLファイル
        output_path (Path): 出力Markdownファイル
        
    Returns:
        bool: 変換成功フラグ
        
    Raises:
        ConversionError: 変換失敗時
    """
```

#### `generate_sync_log(results, output_path)`
```python
def generate_sync_log(results, output_path):
    """
    同期結果ログを生成
    
    Args:
        results (dict): 同期処理結果
        output_path (Path): ログ出力パス
        
    Returns:
        Path: 生成されたログファイルパス
    """
```

## エラーハンドリング

### エラー分類
1. **ファイルシステムエラー**
   - 権限不足
   - ディスク容量不足
   - パス不正

2. **データ処理エラー**
   - JSONフォーマット不正
   - 文字エンコーディング問題
   - サイズ制限超過

3. **同期エラー**
   - ネットワーク問題
   - タイムアウト
   - 競合状態

### エラー対応フロー
```python
try:
    sync_result = perform_sync()
except FileSystemError as e:
    log_error(e)
    retry_with_elevated_permissions()
except DataProcessingError as e:
    log_error(e)
    skip_problematic_file()
except SyncError as e:
    log_error(e)
    schedule_retry()
```

## パフォーマンス仕様

### 処理能力
- **小ファイル（<1MB）**: 100ファイル/秒
- **中ファイル（1-10MB）**: 10ファイル/秒  
- **大ファイル（>10MB）**: 1ファイル/秒

### メモリ使用量
- **基本処理**: 50MB以下
- **大容量ファイル処理**: 最大500MB
- **同時処理数**: 最大5ファイル

### ディスク要件
- **原本保存**: オリジナルサイズの100%
- **変換済み**: オリジナルサイズの150-200%
- **ログファイル**: 処理ファイル数 × 1KB

## セキュリティ仕様

### アクセス制御
```python
# ファイル権限設定
os.chmod(file_path, 0o600)  # 所有者読み書きのみ

# ディレクトリ権限
os.chmod(directory_path, 0o700)  # 所有者フルアクセスのみ
```

### データ保護
- **転送時**: 暗号化不要（ローカル処理）
- **保存時**: ファイルシステム権限による保護
- **アクセスログ**: すべての操作を記録

## 監視・ロギング

### ログレベル
- **DEBUG**: 詳細処理情報
- **INFO**: 一般的な処理状況
- **WARNING**: 注意が必要な状況
- **ERROR**: エラー発生
- **CRITICAL**: システム停止レベル

### 監視ポイント
1. **ファイル増加率**: 1日あたりの新規ファイル数
2. **処理成功率**: 同期処理の成功/失敗比率
3. **ディスク使用量**: ストレージ容量の監視
4. **処理時間**: 同期処理の実行時間

## 将来拡張

### v210での拡張予定
- **並列処理**: マルチプロセシング対応
- **差分同期**: 変更分のみの同期
- **圧縮保存**: gzip圧縮によるストレージ効率化

### v211での拡張予定
- **クラウド同期**: AWS S3, Google Drive連携
- **暗号化**: エンドツーエンド暗号化
- **バージョン管理**: ファイルの版数管理

## 設定ファイル

### config/sync-config.json
```json
{
  "sync_settings": {
    "frequency": "weekly",
    "max_file_size_mb": 100,
    "retention_months": 12,
    "parallel_workers": 3
  },
  "paths": {
    "claude_history": [
      "~/.claude/history",
      "~/AppData/Roaming/Claude/history"
    ],
    "backup_root": "../../../logs/v209/claude-history"
  },
  "alerts": {
    "warning_days": 25,
    "critical_days": 28,
    "email_notifications": false
  },
  "logging": {
    "level": "INFO",
    "file": "logs/sync.log",
    "max_size_mb": 10,
    "backup_count": 5
  }
}