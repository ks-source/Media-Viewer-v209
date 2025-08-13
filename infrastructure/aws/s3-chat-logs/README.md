# AWS S3統合によるAIチャットログ保存システム

## 概要

Media ViewerアプリケーションのAIチャットログをAWS S3に安全・効率的に保存するためのインフラストラクチャとアプリケーション統合機能を提供します。

## Phase 1: 最小構成での実証（2025年8月末〜9月初旬）

### 実装状況
- [x] プロジェクト構造設計
- [ ] AWS S3バケットの基本設定
- [ ] Lambda Function URLによるプリサインドURL生成
- [ ] 基本的な暗号化（SSE-KMS）設定
- [ ] ClaudeCodeからの直接アップロードテスト
- [ ] データの永続性と取得の検証

## アーキテクチャ概要

```
ClaudeCode/Media Viewer
    ↓ (1) プリサインドURL要求
Lambda Function (Presigned URL Generator)
    ↓ (2) プリサインドURL生成
S3 Bucket (Encrypted with KMS)
    ↓ (3) 直接アップロード
    ↓ (4) ダウンロード
```

## セキュリティ設計

### 認証・認可
- **プリサインドURL方式**: ClaudeCodeに永続的なAWS認証情報を持たせない
- **最小権限**: 特定のS3バケット/プレフィックスのみアクセス可能
- **時間制限**: プリサインドURLの有効期限（デフォルト: 1時間）

### 暗号化
- **転送時暗号化**: HTTPS強制
- **保存時暗号化**: SSE-KMS（AWS Key Management Service）
- **バケットレベル暗号化**: デフォルト暗号化設定

## ディレクトリ構造

```
infrastructure/aws/s3-chat-logs/
├── README.md                              # 本ドキュメント
├── phase1/                                # Phase 1実装
│   ├── cloudformation/                    # インフラ定義
│   │   ├── s3-bucket.yaml               # S3バケット設定
│   │   ├── lambda-function.yaml         # Lambda関数定義
│   │   ├── kms-key.yaml                 # KMS暗号化キー
│   │   └── iam-roles.yaml               # IAMロール・ポリシー
│   ├── lambda/                           # Lambda関数コード
│   │   ├── presigned-url-generator/      # プリサインドURL生成
│   │   │   ├── index.js                 # メイン関数
│   │   │   ├── package.json             # 依存関係
│   │   │   └── README.md                # 関数説明
│   │   └── utils/                       # 共通ユーティリティ
│   ├── client/                          # クライアント側統合
│   │   ├── chat-log-uploader.js         # アップロード機能
│   │   ├── chat-log-downloader.js       # ダウンロード機能
│   │   └── config.js                    # 設定管理
│   └── tests/                           # テストコード
│       ├── integration/                 # 統合テスト
│       └── unit/                        # ユニットテスト
├── docs/                                # ドキュメント
│   ├── architecture.md                 # アーキテクチャ詳細
│   ├── security.md                     # セキュリティ設計
│   ├── deployment.md                   # デプロイ手順
│   └── troubleshooting.md              # トラブルシューティング
└── scripts/                            # デプロイ・管理スクリプト
    ├── deploy-phase1.sh                # Phase 1デプロイ
    ├── test-integration.sh             # 統合テスト実行
    └── cleanup.sh                      # リソースクリーンアップ
```

## セットアップ手順

### 前提条件
- AWS CLI設定済み
- 適切なIAM権限（S3, Lambda, KMS, CloudFormation）
- Node.js 18.x以上

### デプロイ手順
```bash
# 1. Phase 1リソースデプロイ
cd infrastructure/aws/s3-chat-logs
./scripts/deploy-phase1.sh

# 2. 統合テスト実行
./scripts/test-integration.sh

# 3. ClaudeCode統合テスト
node client/chat-log-uploader.js --test
```

## 設定値

### S3バケット設定
- **バケット名**: `media-viewer-v209-chat-logs-{環境}`
- **リージョン**: `ap-northeast-1` (東京)
- **バージョニング**: 有効
- **ライフサイクル**: Phase 3で設定予定

### セキュリティ設定
- **KMS暗号化**: カスタマー管理キー
- **パブリックアクセス**: 完全ブロック
- **バケットポリシー**: プリサインドURLのみ許可

## コスト見積もり（月額）

### Phase 1想定（開発・テスト用）
- **S3ストレージ**: ~$0.50（10GB想定）
- **リクエスト**: ~$0.10（1000リクエスト/日）
- **Lambda実行**: ~$0.05（100実行/日）
- **KMS**: ~$1.00（キー使用料）
- **合計**: ~$1.65/月

## 次のステップ

### Phase 2準備（9月中旬〜10月初旬）
- API Gateway統合設計
- 認証システム設計（Cognito）
- WAF設定計画

### 関連ドキュメント
- [外部ストレージ戦略](../../docs/development/ai-collaboration/data-management/external-storage-strategy.md)
- [データ分類マトリックス](../../docs/development/ai-collaboration/data-management/data-classification-matrix.md)

## 更新履歴

| 日付 | 変更内容 | 担当 |
|------|----------|------|
| 2025-08-14 | Phase 1実装計画策定 | ClaudeCode |

---

**注意**: このシステムは機密性の高いAIチャットログを扱います。セキュリティベストプラクティスを必ず遵守してください。