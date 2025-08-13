# AWS S3統合 Phase 1 デプロイメントガイド

## 概要

このガイドでは、Media Viewer v209のAIチャットログをAWS S3に保存するためのPhase 1実装のデプロイ手順を説明します。

## 前提条件

### 必要なツール
- AWS CLI v2.0以上
- Node.js v18.x以上
- Git
- curl
- jq（オプション、JSONフォーマット用）

### AWS権限要件
以下のAWSサービスへのアクセス権限が必要です：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "s3:*",
                "lambda:*",
                "iam:*",
                "kms:*",
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## セットアップ手順

### Step 1: AWS認証設定

```bash
# AWS CLI設定
aws configure
```

入力項目：
- **AWS Access Key ID**: AWSアクセスキー
- **AWS Secret Access Key**: AWSシークレットアクセスキー  
- **Default region name**: `ap-northeast-1` (東京リージョン)
- **Default output format**: `json`

### Step 2: 認証確認

```bash
# 認証情報確認
aws sts get-caller-identity

# 出力例:
# {
#     "UserId": "AIDACKCEVSQ6C2EXAMPLE",
#     "Account": "123456789012", 
#     "Arn": "arn:aws:iam::123456789012:user/username"
# }
```

### Step 3: プロジェクトディレクトリに移動

```bash
cd /path/to/Media-Viewer/v209
```

## デプロイメント実行

### 自動デプロイ（推奨）

```bash
# Phase 1の全リソースをデプロイ
./infrastructure/aws/s3-chat-logs/scripts/deploy-phase1.sh
```

#### オプション付きデプロイ

```bash
# 開発環境へのデプロイ
./infrastructure/aws/s3-chat-logs/scripts/deploy-phase1.sh -e dev

# ステージング環境へのデプロイ  
./infrastructure/aws/s3-chat-logs/scripts/deploy-phase1.sh -e staging

# 本番環境へのデプロイ
./infrastructure/aws/s3-chat-logs/scripts/deploy-phase1.sh -e prod

# S3スタックのみデプロイ
./infrastructure/aws/s3-chat-logs/scripts/deploy-phase1.sh --s3-only

# Lambda関数のみデプロイ（S3スタック必須）
./infrastructure/aws/s3-chat-logs/scripts/deploy-phase1.sh --lambda-only
```

### 手動デプロイ

S3スタックから順番にデプロイする場合：

```bash
# 1. S3バケットとKMS暗号化
aws cloudformation create-stack \
    --stack-name media-viewer-v209-s3-chat-logs \
    --template-body file://infrastructure/aws/s3-chat-logs/phase1/cloudformation/s3-bucket.yaml \
    --parameters ParameterKey=Environment,ParameterValue=dev \
    --capabilities CAPABILITY_NAMED_IAM \
    --region ap-northeast-1

# 2. デプロイ完了を待機
aws cloudformation wait stack-create-complete \
    --stack-name media-viewer-v209-s3-chat-logs \
    --region ap-northeast-1

# 3. Lambda関数
aws cloudformation create-stack \
    --stack-name media-viewer-v209-lambda-presigned-url \
    --template-body file://infrastructure/aws/s3-chat-logs/phase1/cloudformation/lambda-function.yaml \
    --parameters ParameterKey=Environment,ParameterValue=dev \
                 ParameterKey=S3StackName,ParameterValue=media-viewer-v209-s3-chat-logs \
    --capabilities CAPABILITY_IAM \
    --region ap-northeast-1

# 4. Lambda関数デプロイ完了を待機
aws cloudformation wait stack-create-complete \
    --stack-name media-viewer-v209-lambda-presigned-url \
    --region ap-northeast-1
```

## デプロイ結果確認

### デプロイされたリソース確認

```bash
# S3スタック出力確認
aws cloudformation describe-stacks \
    --stack-name media-viewer-v209-s3-chat-logs \
    --region ap-northeast-1 \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

# Lambda関数URL取得
aws cloudformation describe-stacks \
    --stack-name media-viewer-v209-lambda-presigned-url \
    --region ap-northeast-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`FunctionUrl`].OutputValue' \
    --output text
```

### 期待される出力

**S3スタック出力例:**
```
|         OutputKey         |                    OutputValue                     |
|---------------------------|----------------------------------------------------|
| BucketName                | media-viewer-v209-chat-logs-dev-123456789012      |
| BucketArn                 | arn:aws:s3:::media-viewer-v209-chat-logs-dev-...  |
| KMSKeyId                  | a1b2c3d4-e5f6-7890-abcd-ef1234567890             |
| LambdaExecutionRoleArn    | arn:aws:iam::123456789012:role/...                |
```

**Lambda関数URL例:**
```
https://abcdefghijklmnop.lambda-url.ap-northeast-1.on.aws/
```

## 統合テスト実行

### 自動テスト実行

```bash
./infrastructure/aws/s3-chat-logs/scripts/test-integration.sh
```

### 手動テスト

```bash
# 1. Lambda関数URL取得
FUNCTION_URL=$(aws cloudformation describe-stacks \
    --stack-name media-viewer-v209-lambda-presigned-url \
    --region ap-northeast-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`FunctionUrl`].OutputValue' \
    --output text)

# 2. 環境変数設定
export LAMBDA_FUNCTION_URL="$FUNCTION_URL"

# 3. アップロードテスト実行
cd infrastructure/aws/s3-chat-logs/phase1/client
node chat-log-uploader.js --test
```

### 期待される出力

```
Running ChatLogUploader test...
Starting upload of chat log content: test-chat-log-1692025200000.json
Generated presigned URL for: chat-logs/2025-08-14T12-00-00-000Z_test-chat-log-1692025200000.json
Successfully uploaded chat log content to S3: chat-logs/2025-08-14T12-00-00-000Z_test-chat-log-1692025200000.json

✅ Test completed successfully!
Upload details: {
  "success": true,
  "s3Key": "chat-logs/2025-08-14T12-00-00-000Z_test-chat-log-1692025200000.json",
  "fileName": "test-chat-log-1692025200000.json",
  "uploadTimestamp": "2025-08-14T12-00-00-000Z",
  "fileSize": 623,
  "metadata": {
    "testMode": true,
    "testTimestamp": "2025-08-14T12:00:00.000Z"
  }
}
```

## モニタリング・ログ確認

### CloudWatchログ確認

```bash
# Lambda関数ログ確認
aws logs describe-log-groups \
    --log-group-name-prefix /aws/lambda/media-viewer-v209-presigned-url-generator \
    --region ap-northeast-1

# 最新ログストリーム確認
aws logs describe-log-streams \
    --log-group-name /aws/lambda/media-viewer-v209-presigned-url-generator-dev \
    --order-by LastEventTime \
    --descending \
    --max-items 1 \
    --region ap-northeast-1
```

### S3バケット確認

```bash
# アップロードされたファイル一覧
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name media-viewer-v209-s3-chat-logs \
    --region ap-northeast-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
    --output text)

aws s3 ls s3://$BUCKET_NAME/chat-logs/ --region ap-northeast-1
```

## トラブルシューティング

### よくある問題と解決策

#### 1. AWS認証エラー
```
Error: The security token included in the request is invalid
```

**解決策:**
```bash
# AWS認証情報再設定
aws configure
# または
aws configure --profile default
```

#### 2. CloudFormation権限エラー
```
Error: User is not authorized to perform: cloudformation:CreateStack
```

**解決策:**
- IAM権限を確認し、CloudFormation操作権限を付与
- 管理者に権限追加を依頼

#### 3. S3バケット名競合エラー
```
Error: BucketAlreadyExists
```

**解決策:**
```bash
# 異なる環境名でデプロイ
./infrastructure/aws/s3-chat-logs/scripts/deploy-phase1.sh -e dev2
```

#### 4. Lambda関数テストエラー
```
Error: Cannot access Lambda function URL
```

**解決策:**
```bash
# Function URL再確認
aws cloudformation describe-stacks \
    --stack-name media-viewer-v209-lambda-presigned-url \
    --region ap-northeast-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`FunctionUrl`].OutputValue'

# Lambda関数ログ確認
aws logs tail /aws/lambda/media-viewer-v209-presigned-url-generator-dev --follow
```

## デプロイ後の設定

### 1. 環境変数の永続化

```bash
# ~/.bashrc または ~/.zshrc に追加
echo "export LAMBDA_FUNCTION_URL=\"$FUNCTION_URL\"" >> ~/.bashrc
source ~/.bashrc
```

### 2. 定期バックアップ設定（Phase 2で実装予定）

現在はS3ライフサイクル設定により自動アーカイブが設定されています：
- 30日後: Standard-IA
- 90日後: Glacier
- 365日後: Deep Archive

## コスト見積もり

### Phase 1月額コスト（開発環境）

| サービス | 使用量 | 月額費用 |
|----------|--------|----------|
| S3 Standard | 10GB | $0.50 |
| S3 リクエスト | 1,000回/日 | $0.10 |
| Lambda実行 | 100回/日 | $0.05 |
| KMS | キー使用料 | $1.00 |
| CloudWatch | ログ保存 | $0.10 |
| **合計** | | **≈ $1.75/月** |

## 次のステップ

### Phase 2準備
1. API Gateway設計
2. Cognito認証システム設計
3. WAF設定計画

### メンテナンス
- 週次ログ確認
- 月次コスト確認
- 四半期セキュリティレビュー

## サポート

### ドキュメント
- [アーキテクチャ詳細](architecture.md)
- [セキュリティ設計](security.md)
- [トラブルシューティング](troubleshooting.md)

### ログ・モニタリング
- CloudWatch: `/aws/lambda/media-viewer-v209-presigned-url-generator-{env}`
- S3アクセスログ: `s3://{bucket-name}-access-logs/`

---

**重要**: デプロイ後は必ず統合テストを実行し、すべての機能が正常に動作することを確認してください。