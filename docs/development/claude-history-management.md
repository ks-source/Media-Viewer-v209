# ClaudeCode履歴管理システム - v209

## 概要
ClaudeCodeの30日自動削除対策として実装された履歴管理システムの仕様と運用ガイドです。

## システム構成

### ディレクトリ構造
```
logs/v209/claude-history/
├── native/           # 原本バックアップ（JSONL形式）
├── processed/        # 変換済み（Markdown形式）
├── index/           # インデックス（将来実装）
└── sync/            # 同期管理ログ
```

### ファイル形式

#### native/ ディレクトリ
- **形式**: JSONL（JSON Lines）
- **命名規則**: `v[バージョン]-[UUID].jsonl`
- **内容**: ClaudeCodeの生会話データ
- **例**: `v207-fcb64d39-d023-43a7-a2b5-ffaefa65c705.jsonl`

#### processed/ ディレクトリ
- **形式**: Markdown
- **命名規則**: `claude-session-v[バージョン]-[日付]-[時刻]-[短縮UUID].md`
- **内容**: 可読性を向上させた変換済みデータ
- **例**: `claude-session-v207-2025-07-30-04-30-cb4b1868.md`

#### sync/ ディレクトリ
- **形式**: Markdown
- **命名規則**: `sync-log-[YYYYMMDD]-[HHMM].md`
- **内容**: 同期処理の実行ログ
- **例**: `sync-log-20250811-2017.md`

## 同期スクリプト仕様

### scripts/claude-history-sync.py

#### 主要機能
1. **履歴ファイル検索**: ClaudeCodeインストール先から会話履歴を自動検索
2. **バックアップ作成**: 原本をnativeディレクトリにコピー
3. **フォーマット変換**: JSONLからMarkdownへの変換
4. **ログ生成**: 同期結果の詳細ログ作成

#### 実行方法
```bash
# 基本実行
python scripts/claude-history-sync.py

# 詳細ログ付き実行
python scripts/claude-history-sync.py --verbose

# 特定ディレクトリ指定
python scripts/claude-history-sync.py --source /path/to/claude/history
```

#### 設定項目
```python
# 設定ファイル: config/sync-config.json
{
    "source_directories": [
        "~/.claude/history",
        "~/AppData/Roaming/Claude/history"
    ],
    "sync_frequency": "weekly",
    "alert_threshold_days": 25,
    "backup_retention_months": 12
}
```

## 運用ガイドライン

### 1. 定期同期
- **推奨頻度**: 週1回以上
- **実行タイミング**: 毎週日曜日
- **確認事項**: 
  - 新規会話ファイルの検出
  - 処理成功/失敗の確認
  - ディスク容量の監視

### 2. 緊急同期
25日経過ファイルが検出された場合の緊急対応：

```bash
# 緊急同期実行
python scripts/claude-history-sync.py --emergency

# 結果確認
cat logs/v209/claude-history/sync/sync-log-*.md | tail -50
```

### 3. 監視・アラート
- **25日経過ファイル**: 警告アラート
- **28日経過ファイル**: 緊急アラート
- **同期失敗**: エラー通知

## トラブルシューティング

### よくある問題

#### 1. 権限エラー
```bash
# 解決方法
chmod +x scripts/claude-history-sync.py
```

#### 2. Python パスエラー
```bash
# Windows環境
python3 scripts/claude-history-sync.py

# WSL環境
/usr/bin/python3 scripts/claude-history-sync.py
```

#### 3. 大容量ファイル問題
- 100MB以上のファイルはGit管理から除外
- .gitignoreで適切に設定済み
- ローカルストレージでのみ管理

### データ復旧手順

#### 履歴ファイル消失時
1. バックアップからの復旧
2. ClaudeCodeキャッシュからの復元
3. 部分的な手動復旧

#### 同期失敗時
1. ログファイルでエラー原因特定
2. 権限・パス設定の確認
3. 手動同期の実行

## セキュリティ考慮事項

### 1. データ保護
- 個人情報を含む会話内容の適切な管理
- アクセス権限の制限
- 暗号化オプション（将来実装）

### 2. プライバシー
- 機密情報の自動検出・マスク機能
- 削除・除外機能
- 監査ログの維持

## パフォーマンス最適化

### 1. 大容量ファイル対応
- ストリーミング処理による メモリ効率化
- 分割処理による高速化
- 圧縮オプション

### 2. インデックス機能（将来実装）
- 高速検索インデックス
- タグベース分類
- 全文検索対応

## 今後の拡張予定

### フェーズ1（v210）
- 自動化スケジューリング
- Webベース管理画面
- リアルタイム監視

### フェーズ2（v211）
- 機械学習による内容分析
- 自動タグ付け
- 重複除去機能

### フェーズ3（v212）
- クラウド連携
- 複数デバイス同期
- 高度な分析レポート