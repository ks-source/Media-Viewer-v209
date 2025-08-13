# 自動化ルール

## 概要

ClaudeCodeによるプロジェクト管理の自動化に関する詳細ルールを定義します。トリガー条件、自動実行される処理、例外ハンドリング、および人間への通知ルールを明確化し、予測可能で安全な自動化を実現します。

## 自動化の分類

### 🔄 完全自動化（人間の介入なし）
- 定型的な作業
- リスクが極めて低い操作
- 既定のルールに基づく処理

### ⚡ 半自動化（事前承認後実行）
- 一定の判断が必要な作業
- 中程度のリスクを伴う操作
- ビジネス影響の考慮が必要

### 🚨 提案型（人間判断待ち）
- 戦略的な意思決定
- 高リスクな変更
- 複雑な技術判断

## トリガー・ルール定義

### Issue管理自動化

#### 新規Issue作成
```yaml
trigger: Issue作成依頼
conditions:
  - タイトルに特定キーワード含有
  - 必要な情報が揃っている
actions:
  - Issue作成
  - 適切なラベル自動付与
  - プロジェクト追加
  - 初期コメント追加
automation_level: 完全自動化
```

#### ラベル自動分類
```yaml
trigger: Issueタイトル・内容の分析
rules:
  bug_keywords: ["バグ", "エラー", "問題", "不具合"]
  feature_keywords: ["機能", "追加", "新規", "実装"]  
  doc_keywords: ["文書", "ドキュメント", "説明", "手順"]
  urgent_keywords: ["緊急", "至急", "クリティカル"]
actions:
  if bug_keywords: add_label("bug", "priority-high")
  if feature_keywords: add_label("enhancement", "priority-medium")
  if doc_keywords: add_label("documentation", "priority-low")
  if urgent_keywords: add_label("urgent", "priority-critical")
automation_level: 完全自動化
```

#### ステータス遷移
```yaml
trigger: 作業開始・進捗更新
rules:
  start_work:
    condition: "作業開始"の明示的宣言
    action: 
      - remove_label("todo")
      - add_label("in-progress") 
      - add_comment("作業を開始しました")
  
  request_review:
    condition: "レビュー依頼"の明示的宣言
    action:
      - remove_label("in-progress")
      - add_label("review")
      - mention_reviewers()
  
  complete_task:
    condition: "完了"の明示的宣言
    action:
      - close_issue()
      - add_label("completed")
      - update_project_status()
automation_level: 半自動化（確認後実行）
```

### 進捗監視自動化

#### 停滞タスク検出
```yaml
trigger: 毎日9:00自動実行
conditions:
  - "in-progress"ラベルかつ3日以上更新なし
  - "review"ラベルかつ5日以上更新なし
actions:
  - 停滞アラートコメント追加
  - "stale"ラベル付与
  - 担当者への通知
  - 週次レポートに含める
automation_level: 完全自動化
escalation: 7日間停滞でhuman-pmに通知
```

#### 期限管理
```yaml
trigger: 毎日18:00自動実行  
conditions:
  - マイルストーン期限が近い（3日以内）
  - 関連Issueが未完了
actions:
  - 期限アラート作成
  - 進捗状況サマリー生成
  - リスクアセスメント実施
automation_level: 完全自動化
escalation: 期限超過確実でエスカレーション
```

### 品質管理自動化

#### 文書品質チェック
```yaml
trigger: 文書ファイル更新時
checks:
  - 誤字・脱字チェック
  - リンク有効性確認
  - フォーマット一貫性
  - 更新日時・バージョン情報
actions:
  success: "quality-checked"ラベル付与
  failure: 問題点リストをコメント追加
automation_level: 完全自動化
```

#### コード品質チェック
```yaml
trigger: Pull Request作成時
checks:
  - 文法チェック
  - セキュリティスキャン
  - パフォーマンス基本チェック
  - 命名規約確認
actions:
  success: 自動承認候補にマーク
  failure: 詳細な問題レポート作成
automation_level: 半自動化（レビュー必須）
```

## レポート自動生成

### 日次レポート
```yaml
trigger: 毎日19:00自動実行
content:
  - 当日完了タスク一覧
  - 新規作成Issue数
  - 進行中タスクの状況
  - 停滞・遅延アラート
  - 明日の予定タスク
format: GitHub Issue（"daily-report"ラベル）
automation_level: 完全自動化
```

### 週次レポート
```yaml
trigger: 毎週金曜日17:00自動実行
content:
  - 週間完了サマリー
  - マイルストーン進捗
  - 品質メトリクス
  - チーム生産性指標
  - 次週の重点項目
format: Markdown文書＋GitHub Issue
automation_level: 完全自動化
distribution: プロジェクトメンバー全員
```

### 月次分析レポート
```yaml
trigger: 毎月1日9:00自動実行
content:
  - プロジェクト健康度分析
  - 技術債務状況
  - パフォーマンストレンド
  - 改善提案リスト
  - ロードマップ進捗
format: 詳細分析文書
automation_level: 半自動化（レビュー必須）
approval_required: プロジェクトマネージャー
```

## 通知・エスカレーション

### 通知レベル定義

#### 🟢 情報（Info）
```yaml
targets: 開発チーム
timing: 日次バッチ処理
examples:
  - 通常のタスク完了
  - 定期レポート
  - プロセス改善の提案
delivery: 日次レポートに統合
```

#### 🟡 注意（Warning）
```yaml
targets: プロジェクトマネージャー + 関係者
timing: 即座（営業時間内）
examples:
  - タスク遅延の兆候
  - 品質基準の下回り
  - 外部依存の変更検出
delivery: 個別Issue＋Slack/Email
```

#### 🟠 警告（Alert）
```yaml
targets: プロジェクトマネージャー + ステークホルダー
timing: 即座（24時間対応）
examples:
  - マイルストーン遅延確定
  - セキュリティ問題発見
  - 重要な外部サービス障害
delivery: 緊急Issue＋電話/SMS
```

#### 🔴 緊急（Critical）
```yaml
targets: 全関係者
timing: 即座（緊急対応体制）
examples:
  - システムダウン
  - データ漏洩の可能性
  - 法的コンプライアンス違反
delivery: 全チャネル同時通知
```

### エスカレーション・フロー

#### タスク遅延エスカレーション
```
3日遅延 → 開発者への自動リマインド
5日遅延 → プロジェクトマネージャーに報告
7日遅延 → ステークホルダーへの状況報告
10日遅延 → エスカレーション会議の設定
```

#### 品質問題エスカレーション  
```
軽微な問題 → 次回レビューで確認
中程度の問題 → 48時間以内の対処要求
重大な問題 → 即座にプロジェクトマネージャーに報告
致命的な問題 → 緊急対応チーム招集
```

## 例外ハンドリング

### API制限・エラー対応
```yaml
github_api_limit:
  detection: API応答の監視
  action: 
    - 待機時間の計算
    - 優先度に基づくタスクの延期
    - 手動フォールバック準備
  notification: 開発者に状況通知

authentication_error:
  detection: 認証失敗の検出
  action:
    - トークンの有効性確認
    - 権限スコープの検証  
    - 手動介入要請
  notification: 即座に管理者に通知

network_error:
  detection: GitHub接続エラー
  action:
    - 再試行（指数バックオフ）
    - オフラインモードへの切替
    - ローカルキューに処理待ち積載
  notification: 継続的障害で管理者通知
```

### データ整合性保護
```yaml
concurrent_modification:
  detection: 同時編集の検出
  action:
    - コンフリクト解決の試行
    - 人間による手動マージ要請
    - 変更履歴の詳細記録
  notification: コンフリクト発生を関係者に通知

data_corruption:
  detection: データ形式・整合性の異常
  action:
    - 即座に自動処理停止
    - データバックアップの確認
    - 手動復旧手順の提示
  notification: 緊急レベルでの即座通知
```

## 設定管理

### 自動化レベル調整
```yaml
production_mode:
  automation_level: 保守的
  human_approval: 多くの操作で必須
  risk_tolerance: 低
  
development_mode:
  automation_level: 積極的
  human_approval: 最小限
  risk_tolerance: 中
  
emergency_mode:
  automation_level: 手動優先
  human_approval: すべての重要操作
  risk_tolerance: 極低
```

### 閾値設定
```yaml
performance_thresholds:
  task_completion_time: 3日
  review_response_time: 2日  
  bug_fix_time: 1日
  
quality_thresholds:
  code_coverage: 80%
  documentation_coverage: 90%
  broken_links: 0件
  
resource_thresholds:
  api_usage: 80%
  storage_usage: 70%
  concurrent_tasks: 10件
```

## 監査・ログ

### 自動化実行ログ
```yaml
log_format:
  timestamp: ISO8601形式
  action: 実行された処理
  trigger: 実行トリガー
  target: 対象Issue/PR番号
  result: 成功/失敗/部分成功
  duration: 処理時間
  error_details: エラーの詳細（該当時）

retention_policy:
  detailed_logs: 90日間
  summary_logs: 1年間  
  error_logs: 2年間
```

### 承認履歴
```yaml
approval_tracking:
  requester: ClaudeCode
  approver: 承認者名
  request_time: 要請時刻
  approval_time: 承認時刻
  approval_type: 承認/拒否/条件付承認
  conditions: 条件（該当時）
  execution_time: 実行時刻
  execution_result: 実行結果
```

## 継続改善

### 自動化効果測定
```yaml
metrics:
  efficiency:
    - 自動処理件数/日
    - 人間作業削減時間  
    - エラー発生率
  
  quality:
    - 自動検出問題数
    - 品質改善提案数
    - 人間レビュー指摘の減少
  
  satisfaction:
    - 開発者満足度
    - プロセス改善提案数
    - 運用負荷軽減効果

measurement_frequency: 月次
review_frequency: 四半期
adjustment_frequency: 必要に応じて随時
```

### ルール最適化
```yaml
optimization_process:
  1. データ収集: 自動化実行結果の分析
  2. パターン発見: 頻出する問題・改善点の特定
  3. ルール更新: より効果的な自動化ルールの策定
  4. テスト実行: 安全な環境での新ルール検証
  5. 段階展開: 本番環境への慎重な適用
  6. 効果測定: 改善効果の定量的評価
```

---

**注意**: これらの自動化ルールは運用開始後の実績データに基づいて継続的に調整されます。問題や改善提案があれば、GitHubのIssueを通じてフィードバックをお願いします。