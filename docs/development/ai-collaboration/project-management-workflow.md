# プロジェクト管理ワークフロー

## 概要

Media Viewer v209開発における、ClaudeCodeによるAI主体のプロジェクト管理ワークフローを定義します。このワークフローは、従来の人間主導型とは異なる、**AI主導型プロジェクト管理**の実践的な運用手順を提供します。

## 基本原則

### 1. **プロアクティブな管理**
- AIが積極的にタスクの作成・更新を提案
- 進捗の自動監視と報告
- 潜在的な問題の早期発見・対策

### 2. **透明性の確保**
- すべての自動操作をログ化
- 意思決定プロセスの可視化
- 人間への適時な情報共有

### 3. **継続的最適化**
- ワークフローの効果測定
- ボトルネック発見と改善
- ベストプラクティスの蓄積

## ワークフロー概要図

```
[要件発生] → [AI分析] → [タスク生成] → [プロジェクト追加] → [実装] → [テスト] → [完了]
    ↑            ↓           ↓            ↓           ↓        ↓        ↓
[人間承認] ← [進捗報告] ← [状況更新] ← [自動監視] ← [品質確認] ← [結果評価] ← [文書更新]
```

## 詳細ワークフロー

### Phase 1: タスク識別・生成

#### 1.1 要件の発生源
- **人間からの直接指示**
  - 新機能要求
  - バグ報告
  - 改善提案
- **AIによる自動発見**
  - コード分析による潜在的問題
  - ドキュメントの整合性チェック
  - 依存関係の変更検出

#### 1.2 タスク分析プロセス
```bash
# 1. 要件の詳細分析
# - 技術的複雑度の評価
# - 他タスクとの依存関係確認
# - 必要な成果物の特定

# 2. タスク分解
# - 大きなタスクを実装可能な単位に分割
# - 各サブタスクの優先度設定
# - 見積もり工数の算出（概算）
```

#### 1.3 Issue作成
```bash
# 標準的なIssue作成コマンド
gh issue create --repo ks-source/Media-Viewer-v209 \
  --title "【機能分類】具体的なタスク名" \
  --body "$(cat <<'EOF'
## 概要
タスクの簡潔な説明

## 背景・目的
なぜこのタスクが必要か

## 詳細要件
- 具体的な要件1
- 具体的な要件2
- 具体的な要件3

## 受入基準
- [ ] 基準1
- [ ] 基準2
- [ ] 基準3

## 技術的考慮事項
技術的な注意点や制約

## 関連Issue・参考情報
- 関連Issue: #XX
- 参考文書: [リンク]
EOF
)" \
  --label "enhancement,todo" \
  --milestone "v209-stable"
```

### Phase 2: プロジェクト管理

#### 2.1 プロジェクト追加
```bash
# IssueをProjectに自動追加
ISSUE_URL=$(gh issue create ...)
gh project item-add 2 --owner ks-source --url "$ISSUE_URL"
```

#### 2.2 優先度設定
```bash
# 優先度ラベルの追加
gh issue edit <issue_number> --add-label "priority-high"  # 緊急
gh issue edit <issue_number> --add-label "priority-medium"  # 通常
gh issue edit <issue_number> --add-label "priority-low"   # 低優先度
```

#### 2.3 自動ステータス管理
```bash
# タスク開始時
gh issue edit <issue_number> \
  --add-label "in-progress" \
  --remove-label "todo" \
  --add-assignee "@me"

# レビュー依頼時  
gh issue edit <issue_number> \
  --add-label "review" \
  --remove-label "in-progress"

# 完了時
gh issue close <issue_number> \
  --comment "実装完了。詳細は commit-hash を参照。"
```

### Phase 3: 実装・監視

#### 3.1 作業開始プロセス
```bash
# 1. ブランチ作成（該当する場合）
git checkout -b feature/issue-<number>-<description>

# 2. ステータス更新
gh issue edit <issue_number> --add-label "in-progress"

# 3. 開始コメント追加
gh issue comment <issue_number> --body "作業を開始しました。
予定完了日: $(date -d '+3 days' '+%Y-%m-%d')
担当: ClaudeCode"
```

#### 3.2 進捗監視
```bash
# 定期的な進捗確認（自動実行）
gh issue list --repo ks-source/Media-Viewer-v209 --label "in-progress" --json title,number,updatedAt

# 長期停滞タスクの検出
gh issue list --repo ks-source/Media-Viewer-v209 \
  --label "in-progress" \
  --json title,number,updatedAt \
  | jq '.[] | select(.updatedAt < (now - 86400 * 3))'  # 3日以上更新なし
```

#### 3.3 品質確認
```bash
# コードレビュー依頼
gh issue edit <issue_number> --add-label "review"

# テスト結果の記録
gh issue comment <issue_number> --body "## テスト結果
- [x] 単体テスト: PASS
- [x] 統合テスト: PASS  
- [x] 手動テスト: PASS
- [ ] パフォーマンステスト: 未実施"
```

### Phase 4: 完了・報告

#### 4.1 タスク完了
```bash
# 成果物の確認とコミット
git add .
git commit -m "feat: implement feature for issue #<number>

- 実装内容の詳細
- 変更されたファイル一覧
- テスト結果サマリー

Closes #<number>"

# Issue完了
gh issue close <issue_number> --comment "実装完了。
- コミット: $(git rev-parse HEAD)
- プルリクエスト: #XXX（該当する場合）
- テスト結果: すべてPASS"
```

#### 4.2 進捗レポート生成
```bash
#!/bin/bash
# 週次進捗レポート生成スクリプト

echo "# Weekly Progress Report - $(date '+%Y-%m-%d')"
echo ""
echo "## 完了タスク"
gh issue list --repo ks-source/Media-Viewer-v209 \
  --state closed \
  --search "closed:>$(date -d '7 days ago' '+%Y-%m-%d')" \
  --json title,number,closedAt

echo ""
echo "## 進行中タスク"  
gh issue list --repo ks-source/Media-Viewer-v209 \
  --label "in-progress" \
  --json title,number,updatedAt

echo ""
echo "## 待機中タスク"
gh issue list --repo ks-source/Media-Viewer-v209 \
  --label "todo" \
  --json title,number,createdAt
```

## 特殊ケースの処理

### 緊急事態対応
```bash
# 緊急Issue作成
gh issue create --repo ks-source/Media-Viewer-v209 \
  --title "🚨 [緊急] 問題の簡潔な説明" \
  --body "緊急度の高い問題の詳細..." \
  --label "bug,priority-critical,urgent" \
  --assignee "@human-reviewer"
```

### 大型タスクの分割
```bash
# 親Issue作成
PARENT_ISSUE=$(gh issue create --title "【Epic】大型機能実装" ...)

# 子Issue作成（複数）
gh issue create --title "【Sub】サブタスク1" \
  --body "親Issue: $PARENT_ISSUE
  
  ## サブタスク詳細
  ..." \
  --label "epic-subtask"
```

### ブロッカーの処理
```bash
# ブロック状態の記録
gh issue edit <issue_number> \
  --add-label "blocked" \
  --remove-label "in-progress"

gh issue comment <issue_number> --body "## ブロック状況
- ブロック理由: 外部API仕様待ち
- 期待解決日: 2025-08-20
- 代替案: 検討中
- エスカレーション: 必要に応じて@human-pm に報告"
```

## 自動化ルール

### 1. 定期実行タスク
```bash
# 毎日実行: 停滞タスクチェック
0 9 * * * /path/to/check-stale-issues.sh

# 毎週実行: 進捗レポート生成  
0 17 * * 5 /path/to/weekly-report.sh

# 毎月実行: プロジェクト健康度チェック
0 9 1 * * /path/to/project-health-check.sh
```

### 2. トリガーベース自動化
```bash
# Issue作成時: 自動ラベル付け
if [[ "$ISSUE_TITLE" =~ "bug" ]]; then
    gh issue edit $ISSUE_NUMBER --add-label "bug,todo,priority-high"
elif [[ "$ISSUE_TITLE" =~ "feature" ]]; then
    gh issue edit $ISSUE_NUMBER --add-label "enhancement,todo,priority-medium"
fi
```

## メトリクス・KPI

### 追跡すべき指標
1. **タスク処理効率**
   - Issue作成から完了までの平均時間
   - 各ステータスでの平均滞留時間
   - 再オープン率

2. **品質指標**
   - バグ修正にかかる時間
   - レビュー指摘件数
   - テスト通過率

3. **プロジェクト健康度**
   - アクティブなIssue数
   - 停滞Issue数（1週間以上更新なし）
   - マイルストーン達成率

### 測定コマンド例
```bash
# 平均完了時間の算出
gh issue list --state closed --json closedAt,createdAt \
  | jq '[.[] | (.closedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)] | add / length / 86400'

# 停滞Issue検出
gh issue list --label "in-progress" --json number,updatedAt \
  | jq '[.[] | select(.updatedAt < (now - 604800))] | length'
```

## エスカレーション・例外処理

### 人間への報告が必要なケース
1. **技術的意思決定**
   - アーキテクチャの重要な変更
   - 外部依存関係の選択
   - セキュリティに関わる実装

2. **スケジュール影響**
   - マイルストーン遅延の可能性
   - リソース不足の検出
   - 外部依存による遅延

3. **品質問題**
   - 重大なバグの発見
   - パフォーマンス劣化
   - セキュリティホールの発見

### エスカレーション手順
```bash
# 重要な問題の人間への通知
gh issue create --repo ks-source/Media-Viewer-v209 \
  --title "⚠️ [エスカレーション] 人間の判断が必要" \
  --body "## 状況
問題の詳細説明

## 影響度
- スケジュール: 中〜高
- 品質: 中
- リスク: 要検討

## 推奨アクション
1. 選択肢A: ...
2. 選択肢B: ...

## 期限
YYYY-MM-DD までに決定が必要" \
  --label "escalation,priority-high" \
  --assignee "human-pm"
```

## 継続改善

### 月次レビュー項目
1. **ワークフロー効率**
   - 平均タスク完了時間の推移
   - ボトルネック工程の特定
   - 自動化可能な手作業の洗い出し

2. **品質向上**
   - バグ発生パターンの分析
   - レビュー品質の向上策
   - テスト項目の充実

3. **プロセス最適化**
   - 不要な手順の削除
   - 新しい自動化の検討
   - ツール連携の改善

### 改善提案の実装
```bash
# 改善提案Issue作成
gh issue create --repo ks-source/Media-Viewer-v209 \
  --title "【改善提案】ワークフロー最適化" \
  --body "## 現状の問題
...

## 提案内容
...

## 期待効果  
- 効率向上: XX%
- 品質向上: 具体的な指標
- 工数削減: XX時間/週" \
  --label "process-improvement,enhancement"
```

## 関連文書

- [GitHub連携機能マトリックス](github-integration-capabilities.md) - 技術的な実装可能性
- [人間-AI役割分担指針](role-assignment-guidelines.md) - 責任範囲の明確化
- [自動化ルール](automation-rules.md) - 自動化の詳細設定

---

**注意**: このワークフローは実運用を通じて継続的に改善されます。問題や改善提案があれば、GitHubのIssueを通じてフィードバックをお願いします。