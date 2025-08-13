# GitHubストレージポリシー

## 概要

GitHub Repositoryに保存するデータの明確な基準と制限事項、リポジトリ肥大化を防止するためのポリシーを定義します。AI開発特有の大容量データ問題に対応し、効率的で持続可能なリポジトリ管理を実現します。

## 基本方針

### 🎯 目標
1. **軽量リポジトリ**: クローン・CI時間を最小化
2. **検索性確保**: 重要な情報へのアクセス性維持  
3. **コスト最適化**: GitHub有料機能の適切な利用
4. **持続可能性**: 長期的な運用効率の確保

### ⚖️ 原則
- **要点主義**: 要約・決定事項のみをリポジトリ保存
- **履歴重視**: バージョン管理が重要なもののみGit管理
- **リンク活用**: 外部データは参照リンクで連携
- **自動分類**: 手動判断を最小化する明確な基準

## 保存データの分類

### 🟢 GitHub保存【必須】

#### コア開発資産
```yaml
対象:
  - ソースコード (.js, .ts, .css, .html)
  - 設定ファイル (.json, .yaml, .toml)
  - ドキュメント (.md, .txt) ※サイズ制限内
  - テストコード・テストデータ（軽量）

基準:
  - バージョン管理が必須
  - チーム共有が不可欠
  - 頻繁な更新・レビューが必要
  - サイズ: 10MB未満推奨

保存先:
  - リポジトリ直接配置
  - 通常のGitコミット・プッシュ
```

#### プロジェクト管理情報
```yaml
対象:
  - Issues・Pull Requests・Discussions
  - プロジェクトボード・マイルストーン
  - Wiki・README・CHANGELOG
  - GitHub Actions設定

特徴:
  - GitHub UIで管理・閲覧
  - 検索・フィルタリング機能活用
  - 通知・レビューワークフロー統合
```

### 🟡 GitHub保存【条件付き】

#### Git LFS対象データ
```yaml
対象:
  - 重要なログアーカイブ（.log, .json）
  - 設計文書・仕様書（10MB超の.md/.pdf）
  - テストデータ（大容量だが必要）
  - リリース固有アセット

条件:
  - サイズ: 10MB〜100MB
  - アクセス頻度: 低〜中
  - 保存期間: 長期（1年以上）
  - 重要度: 高（履歴保持必須）

設定例:
.gitattributes:
  *.log filter=lfs diff=lfs merge=lfs -text
  docs/archives/*.pdf filter=lfs diff=lfs merge=lfs -text
  test-data/*.json filter=lfs diff=lfs merge=lfs -text

コスト目安:
  50GB: $5/月、100GB: $10/月
```

#### Releases添付
```yaml
対象:
  - リリース固有のアーカイブ
  - インストーラー・配布パッケージ
  - スナップショット・バックアップ

用途:
  - マイルストーン単位の成果物保管
  - ダウンロード・配布用途
  - バージョン固有データの永続化

制限:
  - ファイル: 2GB/個まで
  - リリース: 10GB/個まで
  - 手動アップロード・管理
```

#### Actions Artifacts
```yaml
対象:
  - CI/CD生成物
  - テスト結果・レポート
  - ビルド成果物・ログ

特徴:
  - 自動生成・保存
  - 期限付き（最大90日）
  - ワークフロー連携

制限:
  - アーティファクト: 500MB/個
  - 合計: 10GB/リポジトリ
  - 長期保管は不可
```

### 🔴 GitHub保存【禁止】

#### 大容量・頻繁更新データ
```yaml
対象:
  - 完全チャットログ（.md/.json）
  - AIトレーニングデータ
  - メディアファイル（動画・音声・大画像）
  - ビルド生成物・キャッシュ

理由:
  - Git差分管理に不適
  - リポジトリ肥大化
  - クローン・プッシュ時間増大
  - コスト効率悪化

代替策:
  - ローカル保存
  - 外部ストレージ（S3等）
  - 専用ファイル共有サービス
```

#### 機密・個人情報
```yaml
対象:
  - APIキー・シークレット
  - 個人識別情報（PII）
  - 機密技術情報
  - 社内限定データ

理由:
  - セキュリティリスク
  - コンプライアンス要件
  - アクセス制御限界

代替策:
  - GitHub Secrets
  - 専用シークレット管理
  - アクセス制御付きストレージ
```

## サイズ制限・しきい値

### 📏 ファイルサイズ基準

| サイズ範囲 | 判定 | 推奨アクション |
|-----------|------|-------------|
| 〜1MB | 🟢 直接保存OK | 通常のGitコミット |
| 1MB〜10MB | 🟡 要検討 | 必要性確認後保存 |
| 10MB〜50MB | 🟠 Git LFS推奨 | .gitattributes設定 |
| 50MB〜100MB | 🔴 Git LFS必須 | 警告が出るため対策必須 |
| 100MB〜 | ❌ GitHub保存不可 | 外部ストレージ使用 |

### 📊 リポジトリサイズ管理

```yaml
健全性指標:
  軽量: 〜100MB（理想的）
  普通: 100MB〜500MB（許容範囲）
  重い: 500MB〜1GB（要対策）
  危険: 1GB〜（即座に対策必要）

監視項目:
  - 月次成長率
  - 大容量ファイルの追跡
  - LFS使用量・コスト
  - クローン時間の測定
```

## Git LFS運用ガイド

### 🔧 セットアップ手順

```bash
# 1. Git LFS有効化
git lfs install

# 2. .gitattributes設定
echo "*.log filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
echo "docs/archives/*.pdf filter=lfs diff=lfs merge=lfs -text" >> .gitattributes

# 3. 既存ファイルの移行
git lfs migrate import --include="*.log,*.pdf" --include-ref=refs/heads/main

# 4. LFS状態確認
git lfs ls-files
git lfs status
```

### 📋 推奨パターン設定
```gitattributes
# ログファイル
*.log filter=lfs diff=lfs merge=lfs -text
logs/** filter=lfs diff=lfs merge=lfs -text

# アーカイブ・バックアップ
*.zip filter=lfs diff=lfs merge=lfs -text  
*.tar.gz filter=lfs diff=lfs merge=lfs -text
archives/** filter=lfs diff=lfs merge=lfs -text

# 大容量文書
docs/specifications/*.pdf filter=lfs diff=lfs merge=lfs -text
docs/archives/*.md filter=lfs diff=lfs merge=lfs -text

# テストデータ（大容量）
test-data/**/*.json filter=lfs diff=lfs merge=lfs -text
test-data/**/*.xml filter=lfs diff=lfs merge=lfs -text
```

### 💰 コスト管理

```yaml
課金体系:
  データパック: 50GB/50GB帯域 = $5/月
  追加ストレージ: $0.07/GB/月
  追加帯域: $0.07/GB

使用量監視:
  コマンド: gh api repos/:owner/:repo/lfs
  Dashboard: Settings > Billing > Git LFS data
  
最適化施策:
  - 不要な履歴の削除
  - アーカイブファイルの外部移行
  - 定期的な使用量レビュー
```

## 除外ファイル管理

### 🚫 .gitignore設定

```gitignore
# AI開発特有の除外設定

# チャットログ（大容量）
chat-logs/
*.chat.md
*.conversation.json

# AI作業ファイル
ai-scratch/
working-files/
temp-analysis/

# 大容量メディア
*.mp4
*.avi
*.mov
*.wav
*.mp3

# ビルド成果物
build/
dist/
out/
target/

# キャッシュ・一時ファイル
.cache/
tmp/
*.tmp
*.temp

# OS・IDE固有
.DS_Store
Thumbs.db
.vscode/settings.json
.idea/workspace.xml

# 機密情報
.env
.env.local
secrets/
keys/
*.key
*.pem

# ローカル開発環境
node_modules/
venv/
.venv/
__pycache__/
```

### 📁 ディレクトリ構造の推奨

```
Repository Root/
├── src/                    # ソースコード（Git管理）
├── docs/                   # 軽量ドキュメント（Git管理）  
├── tests/                  # テストコード（Git管理）
├── configs/                # 設定ファイル（Git管理）
├── .github/                # GitHub設定（Git管理）
├── archives/               # 重要アーカイブ（Git LFS）
├── releases/               # リリース固有（Git LFS/Releases）
└── .external-data-links/   # 外部データへのリンク集（Git管理）
```

## Issues・PR活用方針

### 📝 要約記録の標準化

#### AIセッション要約テンプレート
```markdown
## AIセッション要約

**日時**: 2025-08-13 14:30-16:00  
**AI**: ClaudeCode (claude-sonnet-4)  
**担当者**: @username  

### 主な成果
- [ ] 機能Aの実装完了
- [ ] 問題Bの根本原因特定  
- [ ] 設計Cの代替案検討

### 技術的決定
1. **採用案**: XXXアプローチ
   - 理由: パフォーマンス優位
   - トレードオフ: 実装複雑度増加
2. **不採用案**: YYYアプローチ  
   - 理由: 保守コスト高

### 生ログ参照
- **完全ログ**: [S3リンク](https://bucket.s3.amazonaws.com/chat-logs/20250813-session.md)
- **要点抜粋**: 以下に記載

### 次回アクション
- [ ] 機能Aのテスト実装 (@user, 2025-08-14)
- [ ] 設計Cの詳細検討 (@team, 2025-08-15)
```

#### PR説明文テンプレート
```markdown
## 変更概要
AIとの協業により実装したXXX機能

## AIセッション情報
- **期間**: 2025-08-13 〜 2025-08-14
- **主要AI**: ClaudeCode
- **セッション数**: 3回
- **完全ログ**: [外部リンク](#)

## 実装内容
- 新機能: XXX
- 修正項目: YYY  
- 設計変更: ZZZ

## テスト結果
- [x] 単体テスト: PASS
- [x] 統合テスト: PASS
- [x] 手動テスト: PASS

## レビューポイント
1. アーキテクチャ設計の妥当性
2. AI提案コードの品質確認
3. セキュリティ考慮事項
```

### 🔍 検索・タグ戦略

```yaml
Issue/PRラベル体系:
  AI関連:
    - "ai-generated": AI生成コード含む
    - "ai-assisted": AI支援による開発
    - "ai-decision": AI関与の技術決定
  
  データ関連:
    - "data-heavy": 大容量データ関連
    - "external-data": 外部ストレージ使用
    - "lfs-required": Git LFS対象
  
  工程別:
    - "analysis": 分析・調査フェーズ
    - "implementation": 実装フェーズ  
    - "testing": テスト・検証フェーズ

マイルストーン活用:
  - AI機能実装フェーズ
  - データ管理改善フェーズ
  - パフォーマンス最適化フェーズ
```

## 監視・メトリクス

### 📊 定期監視項目

```bash
# 週次実行スクリプト例

#!/bin/bash
echo "=== Repository Health Check ==="

# リポジトリサイズ
echo "Repository size:"
git count-objects -vH

# 大容量ファイル検出
echo "Large files (>10MB):"
git ls-files | xargs ls -l | awk '$5 > 10485760 {print $5/1048576 "MB " $9}' | sort -nr

# LFS使用状況
echo "Git LFS status:"
git lfs ls-files | wc -l
git lfs status

# 最近の追加ファイル
echo "Recent large additions:"
git log --since="7 days ago" --name-status | grep "^A" | head -10
```

### 🚨 アラート設定

```yaml
監視しきい値:
  リポジトリサイズ: 500MB超で警告
  単一ファイル: 50MB超で確認
  月間成長率: 50%超で調査
  LFS使用量: 予算の80%で通知

対応アクション:
  警告レベル: Slackに自動通知
  危険レベル: Issue自動作成
  緊急レベル: 開発停止・対策会議
```

## 有料プラン活用指針

### 💳 契約判断基準

#### 契約推奨ケース
```yaml
組織要件:
  - チーム: 5名以上の開発チーム
  - セキュリティ: Advanced Security機能必須
  - 統制: SAML/SSO・監査ログ必要
  - 管理: Projects高度機能・自動化要求

技術要件:  
  - LFS: 継続的に月50GB以上使用
  - Actions: 月2000分超の利用
  - Packages: プライベートパッケージ配布
  - Codespaces: クラウド開発環境利用
```

#### 契約不要ケース
```yaml
単純な容量問題:
  - 解決策: 外部ストレージ活用で十分
  - 理由: Git制限は解決されない
  - 代替: S3等の方がコスト効率良好

小規模チーム:
  - 解決策: Freeプラン + 外部サービス
  - 理由: 高度管理機能不要
  - 代替: 必要最小限の構成で十分
```

### 📈 段階的アップグレード戦略

```
Phase 1: Free + 外部ストレージ
  ↓ (チーム拡大・要件増加)
Phase 2: Team + LFS最小構成  
  ↓ (セキュリティ・統制強化)
Phase 3: Enterprise + 高度機能活用
```

## 関連文書・ツール

### 📚 関連ガイドライン
- [ローカルストレージガイドライン](local-storage-guidelines.md) - 外部データ管理
- [データ分類マトリックス](data-classification-matrix.md) - 詳細分類基準
- [外部ストレージ戦略](external-storage-strategy.md) - S3等移行計画

### 🛠️ 推奨ツール
```bash
# リポジトリ分析
git-sizer                    # サイズ分析・問題検出
git lfs migrate             # LFS移行支援
github-backup               # リポジトリバックアップ

# 自動化
pre-commit                  # コミット前チェック
gitignore.io               # .gitignore生成
git-secrets                # 機密情報検出
```

---

**注意**: このポリシーは実運用の結果とGitHub機能の進化に基づいて継続的に更新されます。新たな制約や改善策を発見した場合は、適切にポリシーを改訂してください。