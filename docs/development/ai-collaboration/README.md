# AI協業プロジェクト管理ガイドライン

## 概要

Media Viewer v209開発では、ClaudeCodeによるAI主体のプロジェクト管理を採用しています。
このディレクトリには、人間とAIの効果的な協業を実現するためのガイドラインを格納しています。

## 背景

2025年8月13日、v209を独立リポジトリとして分離する過程で、GitHub ProjectsとClaudeCodeの自動連携によるプロジェクト管理システムを構築しました。これは従来の人間主体の開発管理とは異なる、**AI主導型プロジェクト管理**の先駆的な取り組みです。

## ドキュメント構成

### 📋 [GitHub連携機能マトリックス](github-integration-capabilities.md)
**最重要文書**：ClaudeCodeがGitHub Projectsに対してできること・できないことを実証ベースで記録
- 実際の検証結果に基づく機能一覧
- 制限事項と代替手段
- 定期更新による最新情報の維持

### 🔄 [プロジェクト管理ワークフロー](project-management-workflow.md)
AI主体のプロジェクト管理の具体的な流れ
- タスクの自動作成・更新プロセス
- ステータス管理とエスカレーション
- 進捗レポート生成

### 👥 [人間-AI役割分担指針](role-assignment-guidelines.md)
開発における人間とAIの最適な役割分担
- 意思決定権限の明確化
- 承認フローの定義
- 例外処理の手順

### ⚙️ [自動化ルール](automation-rules.md)
プロジェクト管理の自動化に関する詳細ルール
- トリガーとアクション
- 通知設定
- 例外ハンドリング

### 📊 [機能検証履歴](capability-verification-log.md)
ClaudeCodeの機能検証と更新履歴
- 検証日時と結果
- 新機能の発見記録
- GitHub API/CLI更新への対応

## クイックスタート

### 新規開発者向け
1. [GitHub連携機能マトリックス](github-integration-capabilities.md)を読む
2. [役割分担指針](role-assignment-guidelines.md)で自分の役割を理解する
3. [ワークフロー](project-management-workflow.md)に従ってプロジェクトに参加

### AI開発者（ClaudeCode等）向け
1. [機能マトリックス](github-integration-capabilities.md)で実行可能な操作を確認
2. [自動化ルール](automation-rules.md)に従ってタスクを処理
3. 新機能発見時は[検証履歴](capability-verification-log.md)を更新

## 運用原則

### 1. **実証主義**
- 推測ではなく実際の検証結果に基づく
- 定期的な機能確認と文書更新
- エラーや制限事項の正確な記録

### 2. **透明性**
- すべての自動化動作をログ化
- 人間への適切な情報共有
- 意思決定プロセスの可視化

### 3. **継続改善**
- 四半期ごとの運用見直し
- GitHub API更新への適応
- ベストプラクティスの蓄積

## 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|----------|---------|
| 2025-08-13 | 初版作成、基本構造確立 | ClaudeCode |

## 関連文書

- [開発標準](../standards.md) - コーディング・文書化標準
- [作業日報](../work-logs/2025-08-12-github-sync-recovery.md) - GitHub同期問題からの復旧経緯
- [v209技術仕様](../../features/engagedoc/technical-specifications.md) - 技術的背景

---

**注意**: このガイドラインは実際の運用を通じて継続的に改善される生きた文書です。不明点や改善提案があれば、GitHubのIssueを通じてお知らせください。