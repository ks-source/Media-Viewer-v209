# Media Viewer v209 ドキュメント

## 概要
Media Viewer v209は、v208の文書体系を継承し、ClaudeCode履歴管理システムを統合した次世代メディアビューアーです。

## ドキュメント構成

### 📋 要件定義 (requirements/)
- [README.md](requirements/README.md) - 要件定義概要
- [functional-requirements.md](requirements/functional-requirements.md) - 機能要件
- [cross-version-integration/](requirements/cross-version-integration/) - バージョン間統合要件

### 🔧 開発関連 (development/)
- [standards.md](development/standards.md) - 開発標準・規約
- [claude-history-management.md](development/claude-history-management.md) - ClaudeCode履歴管理

### 🚀 セットアップ (getting-started/)
- [setup-guide.md](getting-started/setup-guide.md) - セットアップガイド
- [README.md](getting-started/README.md) - 導入ガイド

### 🏗️ アーキテクチャ (architecture/)
- [system-architecture.md](architecture/system-architecture.md) - システム設計
- [data-flow.md](architecture/data-flow.md) - データフロー

### 📖 技術仕様 (technical/)
- [claude-history-system.md](technical/claude-history-system.md) - 履歴管理システム
- [core-features.md](technical/core-features.md) - コア機能仕様

### 🔍 トラブルシューティング (troubleshooting/)
- [claude-history-recovery.md](troubleshooting/claude-history-recovery.md) - 履歴復旧手順
- [README.md](troubleshooting/README.md) - 一般的な問題解決

### 📝 テンプレート (templates/)
- [claude-session-template.md](templates/claude-session-template.md) - Claude会話記録テンプレート

## v209の重点項目

### 1. ClaudeCode履歴管理システム
- 30日自動削除対策
- native/processed双方向管理
- 週1回以上の定期同期推奨

### 2. Node.js依存関係管理標準
- 共通依存関係の階層化
- バージョン固有設定の分離
- 効率的なパッケージ管理

### 3. Git管理最適化  
- 大容量ファイル対策
- .gitignore最適化
- サイズ制限対応

## 文書更新履歴
- 2025-08-11: v209基本文書体系構築
- 2025-08-12: 履歴管理システム統合完了