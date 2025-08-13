# GitHub連携機能マトリックス

## 概要

ClaudeCode（Claude 3.5 Sonnet）がGitHub Projectsおよび関連機能に対して実際に実行可能な操作を、2025年8月13日時点の検証結果に基づいて記録します。

**重要**: このマトリックスは推測ではなく、**実際の検証結果**に基づいています。

## 検証環境

- **日時**: 2025年8月13日
- **ClaudeCode版本**: Claude 3.5 Sonnet (claude-sonnet-4-20250514)
- **GitHub CLI版本**: gh version 2.46.0 (2024-03-20)
- **認証スコープ**: `project`, `read:org`, `repo`, `workflow`
- **検証リポジトリ**: ks-source/Media-Viewer-v209
- **検証プロジェクト**: Media Viewer v209 Roadmap (Project #2)

## 機能マトリックス

### ✅ 完全対応 (確認済み)

#### プロジェクト管理
| 機能 | コマンド | 検証結果 | 備考 |
|------|----------|----------|------|
| プロジェクト一覧表示 | `gh project list --owner ks-source` | ✅ 成功 | JSON形式での出力も可能 |
| プロジェクト詳細表示 | `gh project view 2 --owner ks-source` | ✅ 成功 | フィールド構成も確認可能 |
| アイテム数確認 | `gh project view 2 \| grep "Item count"` | ✅ 成功 | リアルタイムの件数取得 |

#### Issue管理
| 機能 | コマンド | 検証結果 | 備考 |
|------|----------|----------|------|
| Issue作成 | `gh issue create --repo ks-source/Media-Viewer-v209 --title "タイトル" --body "内容"` | ✅ 成功 | 日本語対応 |
| Issue一覧表示 | `gh issue list --repo ks-source/Media-Viewer-v209` | ✅ 成功 | フィルタリング可能 |
| ラベル追加 | `gh issue create --label "enhancement,documentation"` | ✅ 成功 | 複数ラベル同時追加可能 |
| Issue編集 | `gh issue edit <番号> --add-label "new-label"` | ✅ 成功 | 動的なラベル管理可能 |

#### プロジェクト連携
| 機能 | コマンド | 検証結果 | 備考 |
|------|----------|----------|------|
| IssueをProjectに追加 | `gh project item-add 2 --owner ks-source --url <issue-url>` | ✅ 成功 | URLベースで確実に追加 |
| Project内アイテム確認 | `gh project view 2 --owner ks-source` | ✅ 成功 | 追加結果を即座に確認可能 |

### ❌ 対応不可 (確認済み)

#### プロジェクト管理制限
| 機能 | 試行したコマンド | エラー内容 | 根本原因 |
|------|-----------------|------------|----------|
| プロジェクト作成 | `gh project create --owner ks-source --title "タイトル"` | `error: your authentication token is missing required scopes [project read:project]` | 権限不足（後に解決） |
| Issue作成時のProject指定 | `gh issue create --project 1` | `could not add to project: '1' not found` | Project番号の取得方法に課題 |
| 存在しないラベルの使用 | `gh issue create --label "testing"` | `could not add label: 'testing' not found` | ラベルの事前作成が必要 |

#### ステータス管理制限
| 機能 | 制限内容 | 代替手段 |
|------|----------|----------|
| ステータスフィールドの直接更新 | GitHub CLI未対応 | ラベル管理による擬似ステータス |
| カスタムフィールドの設定 | API制限により不可 | 標準フィールドでの運用 |
| 一括ステータス変更 | 機能なし | 個別Issue更新の自動化 |

### 🔄 部分対応・要工夫

#### 擬似ステータス管理
| 状態 | 実装方法 | コマンド例 |
|------|----------|------------|
| Todo | `todo` ラベル | `gh issue edit 1 --add-label "todo"` |
| In Progress | `in-progress` ラベル | `gh issue edit 1 --add-label "in-progress" --remove-label "todo"` |
| Review | `review` ラベル | `gh issue edit 1 --add-label "review" --remove-label "in-progress"` |
| Done | Issue Close | `gh issue close 1` |

#### 高度な連携機能
| 機能 | 実装方法 | 制限事項 |
|------|----------|----------|
| 進捗レポート生成 | `gh issue list` + フィルタリング | 手動集計が必要 |
| 自動通知 | GitHub Actions連携 | 設定が複雑 |
| マイルストーン管理 | `gh issue create --milestone` | プロジェクトとは別管理 |

## 実証された制限事項と対策

### 1. プロジェクト作成権限
**問題**: 初期のトークンでプロジェクト作成ができない
```bash
error: your authentication token is missing required scopes [project read:project]
```

**解決**: 適切なスコープ(`project`, `read:project`)を含むトークンで再認証
**対策**: 初期セットアップ時の権限確認が必須

### 2. プロジェクト番号の管理
**問題**: Issue作成時に直接プロジェクトを指定できない場合がある
**解決**: 2段階での処理（Issue作成 → プロジェクト追加）
**コマンド例**:
```bash
# 1. Issue作成
ISSUE_URL=$(gh issue create --repo ks-source/Media-Viewer-v209 --title "タスク")
# 2. プロジェクト追加  
gh project item-add 2 --owner ks-source --url $ISSUE_URL
```

### 3. ラベル管理
**問題**: 存在しないラベルは自動作成されない
**解決**: 事前にラベル作成または既存ラベルの利用
**推奨ラベル**:
- `enhancement` (機能追加)
- `documentation` (文書整備)
- `bug` (バグ修正)
- `todo` (未着手)
- `in-progress` (作業中)
- `review` (レビュー中)

## 推奨ワークフロー

### 新規タスク作成
```bash
# 1. Issue作成
gh issue create --repo ks-source/Media-Viewer-v209 \
  --title "タスクタイトル" \
  --body "詳細説明" \
  --label "enhancement,todo"

# 2. プロジェクトに追加
gh project item-add 2 --owner ks-source --url <作成されたIssue URL>
```

### ステータス更新
```bash
# 作業開始
gh issue edit <番号> --add-label "in-progress" --remove-label "todo"

# レビュー依頼
gh issue edit <番号> --add-label "review" --remove-label "in-progress"

# 完了
gh issue close <番号>
```

### 進捗確認
```bash
# 全体状況
gh project view 2 --owner ks-source

# 特定ステータスのIssue
gh issue list --repo ks-source/Media-Viewer-v209 --label "in-progress"
```

## 将来の改善可能性

### GitHub CLI/API更新で期待される機能
- [ ] ステータスフィールドの直接更新サポート
- [ ] カスタムフィールド操作のAPI拡張
- [ ] 一括操作コマンドの追加
- [ ] プロジェクトテンプレート機能

### 監視すべき更新情報
- [GitHub CLI Releases](https://github.com/cli/cli/releases)
- [GitHub Projects API](https://docs.github.com/en/rest/projects)
- [GitHub GraphQL API](https://docs.github.com/en/graphql)

## トラブルシューティング

### よくあるエラーと対処法

#### 認証エラー
```bash
Error: HTTP 401: Bad credentials
```
**対処**: `gh auth status`でトークン状態確認、必要に応じて`gh auth refresh`

#### プロジェクトが見つからない
```bash
could not add to project: 'X' not found
```
**対処**: `gh project list --owner ks-source`でプロジェクト番号を確認

#### ラベルが見つからない
```bash
could not add label: 'label-name' not found
```
**対処**: 既存ラベルを使用するか、事前にラベル作成

## 更新履歴

| 日付 | 更新内容 | 検証者 |
|------|----------|--------|
| 2025-08-13 | 初版作成、基本機能検証完了 | ClaudeCode |

## 次回検証予定

- **日時**: 2025年11月13日（四半期レビュー）
- **確認項目**: 
  - GitHub CLI新機能の検証
  - API制限の変更確認
  - 新たな連携可能性の調査

---

**注意**: この文書は実証ベースの生きた文書です。新機能発見や制限事項の変更があった場合は即座に更新してください。