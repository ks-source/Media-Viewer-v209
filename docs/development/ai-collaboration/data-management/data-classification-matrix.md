# データ分類マトリックス

## 概要

AI開発で生成される多様なデータを体系的に分類し、最適な保存先・管理方針を決定するためのマトリックスです。データの特性・重要度・利用頻度・コスト効率を総合的に評価し、明確で一貫した判定基準を提供します。

## 分類軸と評価基準

### 📊 主要評価軸

#### 1. データサイズ
- **S (Small)**: 〜1MB
- **M (Medium)**: 1MB〜10MB  
- **L (Large)**: 10MB〜100MB
- **XL (Extra Large)**: 100MB〜

#### 2. 更新頻度
- **Static**: 作成後変更なし
- **Low**: 月1回未満の更新
- **Medium**: 週1〜月1回の更新
- **High**: 日1〜週1回の更新
- **RealTime**: 日複数回の更新

#### 3. アクセス頻度
- **Archive**: 年1回未満
- **Low**: 月1回未満
- **Medium**: 週1〜月1回
- **High**: 日1〜週1回
- **Critical**: 日複数回

#### 4. 重要度
- **Low**: 失っても業務に影響なし
- **Medium**: 失うと一部業務に影響
- **High**: 失うと重要業務に影響
- **Critical**: 失うと事業継続に影響

#### 5. 共有範囲
- **Personal**: 個人のみ
- **Team**: チーム内共有
- **Organization**: 組織内共有  
- **Public**: 公開情報

#### 6. 保存期間
- **Temporary**: 〜1週間
- **Short**: 1週間〜3ヶ月
- **Medium**: 3ヶ月〜1年
- **Long**: 1年〜3年
- **Permanent**: 3年以上

## データタイプ別分類表

### 💻 コード・設定関連

| データタイプ | サイズ | 更新頻度 | アクセス頻度 | 重要度 | 推奨保存先 | 理由 |
|------------|-------|---------|------------|--------|-----------|------|
| ソースコード (.js, .ts, .py) | S-M | High | Critical | Critical | 🟢 GitHub直接 | バージョン管理必須 |
| 設定ファイル (.json, .yaml) | S | Medium | High | High | 🟢 GitHub直接 | 環境再現に必要 |
| パッケージ定義 (package.json) | S | Medium | High | High | 🟢 GitHub直接 | 依存関係管理 |
| ビルド設定 (webpack.config.js) | S | Low | Medium | High | 🟢 GitHub直接 | ビルド再現性 |
| 実行バイナリ | L-XL | Low | Low | Medium | ❌ 外部ストレージ | サイズ制限・自動生成可能 |
| ビルドキャッシュ | L-XL | RealTime | High | Low | ❌ ローカル一時 | 再生成可能 |

### 📝 文書・ドキュメント

| データタイプ | サイズ | 更新頻度 | アクセス頻度 | 重要度 | 推奨保存先 | 理由 |
|------------|-------|---------|------------|--------|-----------|------|
| README.md | S | Medium | High | High | 🟢 GitHub直接 | プロジェクト理解に必須 |
| API文書 (.md) | S-M | Medium | High | High | 🟢 GitHub直接 | 開発効率に直結 |
| 設計文書 (< 10MB) | M | Low | Medium | High | 🟢 GitHub直接 | 履歴管理重要 |
| 設計文書 (≥ 10MB) | L | Low | Medium | High | 🟡 Git LFS | 大容量だが重要 |
| 会議資料・議事録 | S-M | Static | Low | Medium | 🟡 GitHub Issues/Wiki | 検索性重視 |
| 仕様書 (PDF) | M-L | Low | Medium | High | 🟡 Git LFS | 外部ツール生成物 |

### 🤖 AI開発特有データ

| データタイプ | サイズ | 更新頻度 | アクセス頻度 | 重要度 | 推奨保存先 | 理由 |
|------------|-------|---------|------------|--------|-----------|------|
| チャット要約・決定記録 | S | Static | High | High | 🟢 GitHub Issues/PR | 検索・参照頻度高 |
| 完全チャットログ (.md) | L-XL | Static | Archive | Medium | 🔴 ローカル/外部 | 大容量・参照頻度低 |
| AIセッション構造化データ (.json) | M-L | Static | Low | Medium | 🔴 ローカル/外部 | 分析用・要約で代替 |
| プロンプトテンプレート | S | Low | Medium | High | 🟢 GitHub直接 | 再利用・共有重要 |
| AI能力分析結果 | M | Static | Medium | High | 🟡 Git LFS/GitHub | 戦略決定に重要 |
| 学習・トレーニングデータ | XL | Static | Archive | Low | ❌ 外部ストレージ | 大容量・特殊用途 |

### 🧪 テスト・品質保証

| データタイプ | サイズ | 更新頻度 | アクセス頻度 | 重要度 | 推奨保存先 | 理由 |
|------------|-------|---------|------------|--------|-----------|------|
| テストコード | S-M | High | High | Critical | 🟢 GitHub直接 | 品質保証に必須 |
| テストデータ (軽量) | S-M | Low | High | High | 🟢 GitHub直接 | テスト再現性 |
| テストデータ (大容量) | L-XL | Low | Medium | Medium | 🟡 Git LFS | 必要だが大容量 |
| テスト結果レポート | S-M | High | High | Medium | 🔴 Actions Artifacts | 自動生成・短期保管 |
| パフォーマンスベンチマーク | S | Medium | Medium | High | 🟢 GitHub直接 | トレンド分析重要 |
| カバレッジレポート | S | High | High | Medium | 🔴 Actions Artifacts | CI連携・短期保管 |

### 📊 分析・レポート

| データタイプ | サイズ | 更新頻度 | アクセス頻度 | 重要度 | 推奨保存先 | 理由 |
|------------|-------|---------|------------|--------|-----------|------|
| 週次・月次レポート | S-M | Low | Medium | High | 🟢 GitHub Issues | 進捗管理・検索性 |
| メトリクス・KPI | S | Medium | High | High | 🟢 GitHub直接 | トレンド分析重要 |
| 詳細分析結果 | M-L | Low | Low | Medium | 🔴 ローカル/外部 | 要約版で十分 |
| ログ分析結果 | L-XL | Medium | Low | Low | 🔴 ローカル/外部 | 大容量・一時的 |
| 競合分析・市場調査 | M | Low | Low | High | 🟡 Git LFS | 戦略決定に重要 |

### 🔒 セキュリティ・機密情報

| データタイプ | サイズ | 更新頻度 | アクセス頻度 | 重要度 | 推奨保存先 | 理由 |
|------------|-------|---------|------------|--------|-----------|------|
| APIキー・シークレット | S | Low | High | Critical | ❌ 専用シークレット管理 | セキュリティ要件 |
| 認証トークン | S | Medium | High | Critical | ❌ GitHub Secrets | セキュリティ要件 |
| 個人情報・PII | S-M | Low | Low | Critical | ❌ 専用保護ストレージ | 法的要件 |
| セキュリティ監査ログ | M-L | High | Archive | Critical | ❌ 専用監査システム | コンプライアンス |
| 脆弱性スキャン結果 | S-M | Medium | Medium | High | 🟡 GitHub Issues (マスク済) | 対応追跡必要 |

### 🎨 メディア・アセット

| データタイプ | サイズ | 更新頻度 | アクセス頻度 | 重要度 | 推奨保存先 | 理由 |
|------------|-------|---------|------------|--------|-----------|------|
| アイコン・小画像 (< 1MB) | S | Low | High | Medium | 🟢 GitHub直接 | UI表示に必要 |
| 画像アセット (1-10MB) | M | Low | Medium | Medium | 🟡 Git LFS | 表示品質重要 |
| 大容量画像・動画 | L-XL | Low | Low | Low | ❌ 外部ストレージ | CDN配信効率 |
| デザインファイル (.psd, .ai) | L-XL | Medium | Low | Medium | ❌ 専用デザインツール | 専用ツール最適 |
| プロトタイプ動画 | XL | Low | Archive | Low | ❌ 外部ストレージ | 大容量・参考用 |

## 判定フローチャート

```
データ分類判定フロー:

1. セキュリティチェック
   機密情報含有? → Yes → 専用セキュアストレージ
   ↓ No
   
2. サイズチェック  
   100MB超? → Yes → 外部ストレージ
   ↓ No (≤100MB)
   
3. 重要度・頻度チェック
   重要度Critical & アクセス頻度High? → Yes → GitHub保存検討
   ↓ No
   
4. 更新頻度チェック
   頻繁更新 & バージョン管理必要? → Yes → GitHub直接
   ↓ No
   
5. 容量効率チェック
   10MB超 & アクセス頻度Low? → Yes → Git LFS または外部
   ↓ No
   
6. デフォルト判定
   GitHub直接保存 (要継続監視)
```

## コスト・効率分析

### 💰 保存先別コスト比較 (100GB/年想定)

| 保存方法 | 初期コスト | 月額コスト | 年額コスト | メリット | デメリット |
|---------|-----------|-----------|-----------|---------|----------|
| GitHub直接 | $0 | $0 | $0 | 無料・統合性 | サイズ制限・重くなる |
| Git LFS | $0 | $10 | $120 | GitHub統合 | 帯域制限・アクセス重い |
| S3 Standard | $0 | $2.3 | $28 | 安価・スケーラブル | GitHub外・管理複雑 |
| S3 IA | $0 | $1.25 | $15 | 低コスト | アクセス料金・遅延 |
| ローカル保存 | $0 | $0 | $0 | 無料・高速 | バックアップ・共有困難 |

### ⚡ パフォーマンス比較

| 指標 | GitHub直接 | Git LFS | 外部ストレージ | ローカル保存 |
|------|-----------|---------|--------------|-------------|
| 読み込み速度 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 書き込み速度 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 検索性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 共有容易性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| バックアップ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |

## 自動分類ルール

### 🤖 自動判定条件

```yaml
# classification-rules.yaml
rules:
  github_direct:
    conditions:
      - file_size_mb: "< 10"
      - importance: ["high", "critical"]
      - access_frequency: ["high", "critical"]
      - contains_secrets: false
    exceptions:
      - file_extension: [".log", ".dump", ".cache"]
      
  git_lfs:
    conditions:
      - file_size_mb: ">= 10 AND < 100"
      - importance: ["high", "critical"]
      - update_frequency: ["static", "low"]
    file_patterns:
      - "*.pdf"
      - "archives/*.md"
      - "test-data/*.json"
      
  external_storage:
    conditions:
      - file_size_mb: ">= 100"
    OR:
      - access_frequency: "archive"
      - contains_secrets: true
      - file_extension: [".mp4", ".avi", ".mov", ".iso"]
      
  local_temporary:
    conditions:
      - retention_period: "temporary"
      - file_type: ["scratch", "draft", "cache"]
      - importance: "low"
```

### 🔧 自動分類スクリプト

```bash
#!/bin/bash
# auto-classify-data.sh

FILE_PATH="$1"
CLASSIFICATION_RULES="$AI_DATA_ROOT/config/classification-rules.yaml"

# ファイル情報取得
FILE_SIZE_MB=$(du -m "$FILE_PATH" | cut -f1)
FILE_EXT="${FILE_PATH##*.}"
FILE_NAME=$(basename "$FILE_PATH")

# セキュリティチェック
if grep -qE "(ghp_|sk-|pk_|api[_-]?key)" "$FILE_PATH" 2>/dev/null; then
    echo "SECURITY_RISK"
    exit 1
fi

# サイズベース判定
if [ "$FILE_SIZE_MB" -ge 100 ]; then
    echo "EXTERNAL_STORAGE"
elif [ "$FILE_SIZE_MB" -ge 10 ]; then
    # 重要度・頻度による詳細判定
    case "$FILE_EXT" in
        "md"|"pdf"|"json")
            if [[ "$FILE_NAME" =~ (spec|design|analysis) ]]; then
                echo "GIT_LFS"
            else
                echo "GITHUB_DIRECT"
            fi
            ;;
        "log"|"dump"|"cache")
            echo "LOCAL_TEMPORARY"
            ;;
        *)
            echo "GIT_LFS"
            ;;
    esac
elif [ "$FILE_SIZE_MB" -ge 1 ]; then
    # 中容量ファイルの詳細判定
    case "$FILE_EXT" in
        "js"|"ts"|"py"|"md"|"json"|"yaml")
            echo "GITHUB_DIRECT"
            ;;
        "mp4"|"avi"|"mov"|"iso")
            echo "EXTERNAL_STORAGE"
            ;;
        *)
            echo "GITHUB_DIRECT"
            ;;
    esac
else
    # 小容量ファイルは基本的にGitHub直接
    echo "GITHUB_DIRECT"
fi
```

## 例外処理・特殊ケース

### ⚠️ 判定困難ケース

#### 境界値ケース
| ケース | 判定方針 | 理由 |
|--------|----------|------|
| 9.9MB の重要文書 | GitHub直接 | 10MB境界の安全マージン |
| 10.1MB のログファイル | 外部ストレージ | 大容量・参照頻度低 |
| 頻繁更新される大容量ファイル | 外部ストレージ + 要約をGitHub | 両方のメリット活用 |
| 機密性のある重要文書 | 専用セキュアストレージ | セキュリティ優先 |

#### 技術制約による例外
| 制約 | 対応策 | 実装方法 |
|------|--------|----------|
| Git LFS予算制限 | 優先度による選択的適用 | 重要度Critical優先 |
| 外部ストレージ未導入 | 段階的ローカル保存 | 移行準備と並行 |
| セキュリティポリシー制約 | 組織承認後の段階適用 | 承認済み範囲から開始 |

### 🔄 定期見直しプロセス

#### 月次レビュー項目
```bash
# データ分類効果測定スクリプト
#!/bin/bash

echo "=== データ分類効果測定 ==="

# 1. 保存先別容量分析
echo "GitHub Repository: $(du -sh $REPO_PATH | cut -f1)"
echo "Git LFS: $(git lfs ls-files | wc -l) files"
echo "Local Storage: $(du -sh $AI_DATA_ROOT | cut -f1)"

# 2. 誤分類検出
find $REPO_PATH -size +50M -type f | while read file; do
    echo "Large file in repo: $file"
done

# 3. コスト効率分析
GITHUB_SIZE=$(du -sm $REPO_PATH | cut -f1)
if [ $GITHUB_SIZE -gt 500 ]; then
    echo "WARNING: Repository size exceeding 500MB"
fi

# 4. アクセスパターン分析
find $AI_DATA_ROOT -type f -atime -30 | wc -l
echo "Files accessed in last 30 days: $(find $AI_DATA_ROOT -type f -atime -30 | wc -l)"
```

#### 四半期最適化
- 分類ルールの精度改善
- 新しいデータタイプの分類基準追加
- コスト・パフォーマンス改善施策実装
- 自動化範囲の拡大検討

## 関連文書・ツール

### 📚 関連ガイドライン
- [GitHubストレージポリシー](github-storage-policy.md) - GitHub保存の詳細ルール
- [ローカルストレージガイドライン](local-storage-guidelines.md) - ローカル保存の具体的手順
- [外部ストレージ戦略](external-storage-strategy.md) - S3等への移行計画

### 🛠️ 推奨ツール
```bash
# ファイル分析
file-classifier           # 自動分類ツール
disk-usage-analyzer      # 容量分析
git-sizer               # リポジトリサイズ分析

# 自動化
pre-commit              # コミット前チェック
husky                   # Git hooks管理
github-actions          # CI/CD自動化
```

---

**注意**: このデータ分類マトリックスは、実際の運用データと技術進化に基づいて継続的に改善されます。新しいデータタイプや利用パターンを発見した場合は、適切な分類基準を追加してください。