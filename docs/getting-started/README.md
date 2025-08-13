# セットアップガイド - Media Viewer v209

## クイックスタート

### 1. 前提条件の確認
```bash
# Python バージョン確認
python --version  # Python 3.8+ 必須

# Node.js バージョン確認  
node --version    # Node.js v18+ 推奨

# Git バージョン確認
git --version     # Git 2.30+ 推奨
```

### 2. プロジェクトセットアップ
```bash
# リポジトリクローン
git clone https://github.com/ks-source/Code.git
cd Code/HTML/Media-Viewer/v209

# 初期設定確認
cat NextAction_250811.txt
```

### 3. ClaudeCode履歴同期の初回実行
```bash
# 同期スクリプトの実行
python scripts/claude-history-sync.py

# 結果確認
ls -la ../../../logs/v209/claude-history/
```

## 詳細セットアップ

詳細なセットアップ手順については、[setup-guide.md](setup-guide.md)を参照してください。

## トラブルシューティング

問題が発生した場合は、[../troubleshooting/](../troubleshooting/)を確認してください。

## 次のステップ

1. [開発標準](../development/standards.md)の確認
2. [システム設計](../architecture/system-design.md)の理解  
3. [ClaudeCode履歴管理](../development/claude-history-management.md)の設定