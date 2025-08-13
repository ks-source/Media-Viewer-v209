#!/bin/bash

# AWS S3 Chat Logs Integration - Phase 1 Deployment Script
# Media Viewer v209

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PHASE1_DIR="$PROJECT_ROOT/phase1"

# Default values
ENVIRONMENT="dev"
AWS_REGION="ap-northeast-1"
STACK_PREFIX="media-viewer-v209"
S3_STACK_NAME="${STACK_PREFIX}-s3-chat-logs"
LAMBDA_STACK_NAME="${STACK_PREFIX}-lambda-presigned-url"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
AWS S3 Chat Logs Integration - Phase 1 Deployment Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENVIRONMENT    Deployment environment (dev, staging, prod) [default: dev]
    -r, --region REGION             AWS region [default: ap-northeast-1]
    -p, --prefix PREFIX             Stack name prefix [default: media-viewer-v209]
    --s3-only                       Deploy S3 stack only
    --lambda-only                   Deploy Lambda stack only (requires S3 stack)
    --skip-validation               Skip pre-deployment validation
    -h, --help                      Show this help message

Environment Variables:
    AWS_PROFILE                     AWS CLI profile to use
    AWS_REGION                      AWS region (overridden by --region)

Examples:
    $0                              Deploy to dev environment
    $0 -e staging -r us-east-1      Deploy to staging in us-east-1
    $0 --s3-only                    Deploy S3 resources only
    $0 --lambda-only                Deploy Lambda function only

EOF
}

# Parse command line arguments
DEPLOY_S3=true
DEPLOY_LAMBDA=true
SKIP_VALIDATION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        -p|--prefix)
            STACK_PREFIX="$2"
            S3_STACK_NAME="${STACK_PREFIX}-s3-chat-logs"
            LAMBDA_STACK_NAME="${STACK_PREFIX}-lambda-presigned-url"
            shift 2
            ;;
        --s3-only)
            DEPLOY_LAMBDA=false
            shift
            ;;
        --lambda-only)
            DEPLOY_S3=false
            shift
            ;;
        --skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validation
validate_environment() {
    case $ENVIRONMENT in
        dev|staging|prod)
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
            exit 1
            ;;
    esac
}

validate_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed or not in PATH"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured or invalid"
        exit 1
    fi

    local aws_account_id=$(aws sts get-caller-identity --query Account --output text)
    local aws_user_arn=$(aws sts get-caller-identity --query Arn --output text)
    
    print_info "AWS Account ID: $aws_account_id"
    print_info "AWS User/Role: $aws_user_arn"
    print_info "AWS Region: $AWS_REGION"
}

validate_cloudformation_templates() {
    local templates=()
    
    if [ "$DEPLOY_S3" = true ]; then
        templates+=("$PHASE1_DIR/cloudformation/s3-bucket.yaml")
    fi
    
    if [ "$DEPLOY_LAMBDA" = true ]; then
        templates+=("$PHASE1_DIR/cloudformation/lambda-function.yaml")
    fi

    for template in "${templates[@]}"; do
        if [ ! -f "$template" ]; then
            print_error "CloudFormation template not found: $template"
            exit 1
        fi
        
        print_info "Validating CloudFormation template: $(basename "$template")"
        if ! aws cloudformation validate-template --template-body "file://$template" --region "$AWS_REGION" &> /dev/null; then
            print_error "CloudFormation template validation failed: $template"
            exit 1
        fi
    done
    
    print_success "All CloudFormation templates are valid"
}

# Deployment functions
deploy_s3_stack() {
    print_info "Deploying S3 stack: $S3_STACK_NAME"
    
    local template_file="$PHASE1_DIR/cloudformation/s3-bucket.yaml"
    local parameters=(
        "ParameterKey=Environment,ParameterValue=$ENVIRONMENT"
        "ParameterKey=BucketNamePrefix,ParameterValue=media-viewer-v209-chat-logs"
    )

    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$S3_STACK_NAME" --region "$AWS_REGION" &> /dev/null; then
        print_info "Updating existing S3 stack..."
        aws cloudformation update-stack \
            --stack-name "$S3_STACK_NAME" \
            --template-body "file://$template_file" \
            --parameters "${parameters[@]}" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION"
    else
        print_info "Creating new S3 stack..."
        aws cloudformation create-stack \
            --stack-name "$S3_STACK_NAME" \
            --template-body "file://$template_file" \
            --parameters "${parameters[@]}" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$AWS_REGION" \
            --tags "Key=Environment,Value=$ENVIRONMENT" "Key=Project,Value=MediaViewer-v209" "Key=Component,Value=ChatLogStorage"
    fi

    # Wait for stack deployment to complete
    print_info "Waiting for S3 stack deployment to complete..."
    aws cloudformation wait stack-create-complete --stack-name "$S3_STACK_NAME" --region "$AWS_REGION" 2>/dev/null || \
    aws cloudformation wait stack-update-complete --stack-name "$S3_STACK_NAME" --region "$AWS_REGION"

    print_success "S3 stack deployment completed successfully"
}

deploy_lambda_stack() {
    print_info "Deploying Lambda stack: $LAMBDA_STACK_NAME"
    
    local template_file="$PHASE1_DIR/cloudformation/lambda-function.yaml"
    local parameters=(
        "ParameterKey=Environment,ParameterValue=$ENVIRONMENT"
        "ParameterKey=S3StackName,ParameterValue=$S3_STACK_NAME"
        "ParameterKey=FunctionName,ParameterValue=media-viewer-v209-presigned-url-generator"
    )

    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name "$LAMBDA_STACK_NAME" --region "$AWS_REGION" &> /dev/null; then
        print_info "Updating existing Lambda stack..."
        aws cloudformation update-stack \
            --stack-name "$LAMBDA_STACK_NAME" \
            --template-body "file://$template_file" \
            --parameters "${parameters[@]}" \
            --capabilities CAPABILITY_IAM \
            --region "$AWS_REGION"
    else
        print_info "Creating new Lambda stack..."
        aws cloudformation create-stack \
            --stack-name "$LAMBDA_STACK_NAME" \
            --template-body "file://$template_file" \
            --parameters "${parameters[@]}" \
            --capabilities CAPABILITY_IAM \
            --region "$AWS_REGION" \
            --tags "Key=Environment,Value=$ENVIRONMENT" "Key=Project,Value=MediaViewer-v209" "Key=Component,Value=ChatLogStorage"
    fi

    # Wait for stack deployment to complete
    print_info "Waiting for Lambda stack deployment to complete..."
    aws cloudformation wait stack-create-complete --stack-name "$LAMBDA_STACK_NAME" --region "$AWS_REGION" 2>/dev/null || \
    aws cloudformation wait stack-update-complete --stack-name "$LAMBDA_STACK_NAME" --region "$AWS_REGION"

    print_success "Lambda stack deployment completed successfully"
}

get_stack_outputs() {
    print_info "Retrieving deployment information..."
    
    echo
    echo "=== Deployment Summary ==="
    echo "Environment: $ENVIRONMENT"
    echo "Region: $AWS_REGION"
    echo "Date: $(date)"
    echo

    if [ "$DEPLOY_S3" = true ]; then
        echo "S3 Stack Outputs:"
        aws cloudformation describe-stacks \
            --stack-name "$S3_STACK_NAME" \
            --region "$AWS_REGION" \
            --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
            --output table
        echo
    fi

    if [ "$DEPLOY_LAMBDA" = true ]; then
        echo "Lambda Stack Outputs:"
        aws cloudformation describe-stacks \
            --stack-name "$LAMBDA_STACK_NAME" \
            --region "$AWS_REGION" \
            --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
            --output table
        
        # Get Function URL for easy access
        local function_url=$(aws cloudformation describe-stacks \
            --stack-name "$LAMBDA_STACK_NAME" \
            --region "$AWS_REGION" \
            --query 'Stacks[0].Outputs[?OutputKey==`FunctionUrl`].OutputValue' \
            --output text)
        
        if [ -n "$function_url" ]; then
            echo
            echo "🚀 Lambda Function URL: $function_url"
            echo
            echo "To test the integration, run:"
            echo "  export LAMBDA_FUNCTION_URL=\"$function_url\""
            echo "  node infrastructure/aws/s3-chat-logs/phase1/client/chat-log-uploader.js --test"
        fi
    fi
}

# Main execution
main() {
    print_info "Starting AWS S3 Chat Logs Integration - Phase 1 Deployment"
    print_info "Environment: $ENVIRONMENT"
    print_info "AWS Region: $AWS_REGION"
    print_info "Stack Prefix: $STACK_PREFIX"
    echo

    # Validation
    if [ "$SKIP_VALIDATION" != true ]; then
        validate_environment
        validate_aws_cli
        validate_cloudformation_templates
        echo
    fi

    # Deployment
    if [ "$DEPLOY_S3" = true ]; then
        deploy_s3_stack
        echo
    fi

    if [ "$DEPLOY_LAMBDA" = true ]; then
        deploy_lambda_stack
        echo
    fi

    # Summary
    get_stack_outputs

    print_success "Phase 1 deployment completed successfully!"
    
    if [ "$DEPLOY_LAMBDA" = true ]; then
        echo
        print_info "Next steps:"
        echo "  1. Test the integration using the chat-log-uploader client"
        echo "  2. Verify logs in CloudWatch"
        echo "  3. Check S3 bucket for uploaded test files"
        echo "  4. Proceed with Phase 2 planning"
    fi
}

# Run main function
main "$@"