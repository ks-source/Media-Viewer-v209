# ClaudeCode履歴復旧ガイド - v209

## 概要
ClaudeCode履歴管理システムでトラブルが発生した際の復旧手順を説明します。

## 緊急対応手順

### 1. 緊急度判定
```
緊急度レベル:
🔴 CRITICAL: 履歴が完全消失、25日以内の履歴がある
🟡 HIGH: 一部履歴が消失、同期が1週間以上停止
🟢 MEDIUM: 同期エラーが継続、ログに異常
🔵 LOW: 軽微な警告、パフォーマンス低下
```

### 2. 即座の対応 (CRITICAL)
```bash
# 1. ClaudeCode履歴の緊急バックアップ
mkdir -p emergency_backup/$(date +%Y%m%d_%H%M%S)
cp -r ~/.claude/history/* emergency_backup/$(date +%Y%m%d_%H%M%S)/

# 2. 利用可能な履歴の確認
find ~/.claude/history -name "*.jsonl" -mtime -30 | wc -l

# 3. 緊急同期実行
python scripts/claude-history-sync.py --emergency
```

## 一般的なトラブルシューティング

### 1. 同期スクリプトが実行できない

#### 症状
```
python scripts/claude-history-sync.py
Permission denied
```

#### 原因と対処
```bash
# 権限問題の解決
chmod +x scripts/claude-history-sync.py

# Pythonパス問題の解決
which python3
/usr/bin/python3 scripts/claude-history-sync.py

# 依存関係問題の解決
pip install -r requirements.txt  # (将来実装)
```

### 2. ClaudeCode履歴ディレクトリが見つからない

#### 症状
```
Error: ClaudeCode history directory not found
```

#### 対処法
```bash
# Windowsでの一般的な場所を確認
ls -la ~/AppData/Roaming/Claude/
ls -la ~/AppData/Local/Claude/

# WSLでの場所確認
ls -la /mnt/c/Users/$USER/AppData/Roaming/Claude/
ls -la /mnt/c/Users/$USER/AppData/Local/Claude/

# 手動でディレクトリ指定
python scripts/claude-history-sync.py --source "/path/to/claude/history"
```

### 3. 大容量ファイルによるGitエラー

#### 症状
```
remote: error: File size exceeds GitHub's file size limit of 100.00 MB
error: failed to push some refs
```

#### 対処法
```bash
# .gitignoreの確認・修正
echo "**/logs/" >> .gitignore

# Git履歴からの削除
git rm -r --cached logs/
git commit -m "Remove large files from tracking"

# 強制プッシュ（注意！）
git push --force-with-lease origin main
```

### 4. 履歴ファイルの破損

#### 症状
- JSONLファイルが読み込めない
- 変換処理でエラーが発生

#### 対処法
```bash
# ファイル破損チェック
python -m json.tool file.jsonl > /dev/null

# 破損ファイルの隔離
mkdir -p quarantine
mv broken_file.jsonl quarantine/

# バックアップからの復旧
cp emergency_backup/*/broken_file.jsonl ./
```

## 高度な復旧手順

### 1. 完全システム復旧

#### 状況: すべての履歴データが消失
```bash
# 1. システム全体のバックアップ確認
find . -name "*.jsonl" -o -name "*claude*" | head -20

# 2. ClaudeCode再インストール後の履歴復旧
# (ClaudeCodeの再インストールが必要な場合)

# 3. 緊急バックアップからの復旧
rsync -av emergency_backup/latest/ logs/v209/claude-history/native/

# 4. 処理済みデータの再生成
python scripts/claude-history-sync.py --rebuild-processed
```

### 2. 部分的データ復旧

#### 状況: 特定期間の履歴のみ消失
```bash
# 1. 消失期間の特定
ls -la logs/v209/claude-history/native/ | grep "2025-08"

# 2. ClaudeCodeキャッシュからの復旧試行
find ~/.claude -name "*.jsonl" -newermt "2025-08-01" ! -newermt "2025-08-31"

# 3. 部分同期実行
python scripts/claude-history-sync.py --date-range "2025-08-01,2025-08-31"
```

### 3. 設定ファイル復旧

#### 状況: 設定が破損・消失
```bash
# デフォルト設定の復元
cat > config/sync-config.json << 'EOF'
{
  "sync_settings": {
    "frequency": "weekly",
    "max_file_size_mb": 100,
    "retention_months": 12
  },
  "paths": {
    "claude_history": ["~/.claude/history"],
    "backup_root": "../../../logs/v209/claude-history"
  }
}
EOF
```

## 予防措置

### 1. 定期バックアップスクリプト

#### 週次バックアップ自動化
```bash
#!/bin/bash
# weekly_backup.sh
BACKUP_DIR="backups/weekly/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# 重要ファイルのバックアップ
cp -r logs/v209/claude-history/native/ "$BACKUP_DIR/"
cp -r docs/ "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"

# 古いバックアップの削除（3ヶ月以上）
find backups/weekly/ -type d -mtime +90 -exec rm -rf {} \;
```

### 2. ヘルスチェック機能

#### 日次ヘルスチェック
```python
#!/usr/bin/env python3
# health_check.py
import os
from datetime import datetime, timedelta

def check_system_health():
    """システムヘルスチェック"""
    issues = []
    
    # ディスク容量チェック
    # 最新同期チェック
    # ファイル整合性チェック
    
    return issues

if __name__ == "__main__":
    issues = check_system_health()
    if issues:
        print(f"⚠️  {len(issues)} issues found:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("✅ System healthy")
```

### 3. 監視アラート

#### 重要イベントの監視
```bash
# ログ監視（将来実装）
tail -f logs/sync.log | while read line; do
  if echo "$line" | grep -q "ERROR\|CRITICAL"; then
    echo "$(date): Alert - $line" >> alerts.log
    # 通知処理（メール、Slack等）
  fi
done
```

## 復旧後の検証

### 1. データ整合性確認
```bash
# ファイル数の確認
echo "Native files: $(find logs/v209/claude-history/native -name "*.jsonl" | wc -l)"
echo "Processed files: $(find logs/v209/claude-history/processed -name "*.md" | wc -l)"

# ファイルサイズの確認
du -sh logs/v209/claude-history/*/
```

### 2. 機能動作確認
```bash
# 同期機能のテスト
python scripts/claude-history-sync.py --dry-run

# Git状態の確認
git status
git log --oneline -5
```

### 3. パフォーマンステスト
```bash
# 処理時間の測定
time python scripts/claude-history-sync.py --test-mode

# リソース使用量の確認
top -p $(pgrep -f claude-history-sync)
```

## エスカレーション手順

### レベル1: 自動復旧失敗
1. ログファイルの詳細確認
2. 手動コマンドでの復旧試行
3. バックアップからの部分復旧

### レベル2: 重大なデータ損失
1. 全バックアップの棚卸し
2. ClaudeCodeサポートへの問い合わせ検討
3. 代替手段の検討

### レベル3: システム全体の機能停止
1. プロジェクト全体のバックアップ
2. 新しい環境での復旧
3. データ移行・検証作業

## 復旧作業ログテンプレート

### 作業記録
```markdown
# 復旧作業ログ - [日付]

## インシデント概要
- **発生日時**: 
- **重要度**: 
- **影響範囲**: 

## 実施作業
1. [時刻] 作業内容1
2. [時刻] 作業内容2

## 結果
- **復旧状況**: 
- **残課題**: 

## 今後の対策
- **予防措置**: 
- **改善点**: 
```

---

**重要な注意事項**:
- 復旧作業前は必ず現状のバックアップを取得
- 不明な点があれば作業を中止し、確認を優先
- 復旧後は必ず動作確認とテストを実施
- 全ての復旧作業は詳細にログを記録