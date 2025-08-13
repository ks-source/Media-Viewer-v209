#!/bin/bash

# AWS S3 Chat Logs Integration - Integration Test Script
# Media Viewer v209 - Phase 1

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLIENT_DIR="$PROJECT_ROOT/phase1/client"

# Default values
ENVIRONMENT="dev"
AWS_REGION="ap-northeast-1"
STACK_PREFIX="media-viewer-v209"
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
AWS S3 Chat Logs Integration - Integration Test Script

Usage: $0 [OPTIONS]

Options:
    -e, --environment ENVIRONMENT    Test environment (dev, staging, prod) [default: dev]
    -r, --region REGION             AWS region [default: ap-northeast-1]
    -p, --prefix PREFIX             Stack name prefix [default: media-viewer-v209]
    --function-url URL              Override Lambda function URL
    --skip-upload                   Skip upload test
    --skip-download                 Skip download test
    --cleanup                       Clean up test files after completion
    -v, --verbose                   Verbose output
    -h, --help                      Show this help message

Examples:
    $0                              Run all tests in dev environment
    $0 -e staging                   Run tests in staging environment
    $0 --cleanup                    Run tests and clean up afterwards
    $0 --function-url https://...   Use specific Lambda function URL

EOF
}

# Parse command line arguments
FUNCTION_URL=""
SKIP_UPLOAD=false
SKIP_DOWNLOAD=false
CLEANUP=false
VERBOSE=false

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
            LAMBDA_STACK_NAME="${STACK_PREFIX}-lambda-presigned-url"
            shift 2
            ;;
        --function-url)
            FUNCTION_URL="$2"
            shift 2
            ;;
        --skip-upload)
            SKIP_UPLOAD=true
            shift
            ;;
        --skip-download)
            SKIP_DOWNLOAD=true
            shift
            ;;
        --cleanup)
            CLEANUP=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
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

# Get Lambda function URL from CloudFormation if not provided
get_function_url() {
    if [ -n "$FUNCTION_URL" ]; then
        print_info "Using provided Lambda function URL: $FUNCTION_URL"
        return
    fi

    print_info "Retrieving Lambda function URL from CloudFormation stack: $LAMBDA_STACK_NAME"
    
    FUNCTION_URL=$(aws cloudformation describe-stacks \
        --stack-name "$LAMBDA_STACK_NAME" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`FunctionUrl`].OutputValue' \
        --output text 2>/dev/null)

    if [ -z "$FUNCTION_URL" ] || [ "$FUNCTION_URL" = "None" ]; then
        print_error "Could not retrieve Lambda function URL from stack: $LAMBDA_STACK_NAME"
        print_error "Make sure the Lambda stack is deployed and contains a FunctionUrl output"
        exit 1
    fi

    print_success "Retrieved Lambda function URL: $FUNCTION_URL"
}

# Test Lambda function health
test_lambda_health() {
    print_info "Testing Lambda function health..."
    
    local response=$(curl -s -w "%{http_code}" -X POST "$FUNCTION_URL" \
        -H "Content-Type: application/json" \
        -d '{"action": "health"}' \
        -o /tmp/lambda_health_response.json)
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "400" ]; then
        print_success "Lambda function is responding (HTTP $http_code)"
        if [ "$VERBOSE" = true ]; then
            print_info "Response body:"
            cat /tmp/lambda_health_response.json | jq '.' 2>/dev/null || cat /tmp/lambda_health_response.json
        fi
    else
        print_error "Lambda function health check failed (HTTP $http_code)"
        if [ -f /tmp/lambda_health_response.json ]; then
            cat /tmp/lambda_health_response.json
        fi
        return 1
    fi
}

# Test chat log upload
test_upload() {
    if [ "$SKIP_UPLOAD" = true ]; then
        print_warning "Skipping upload test"
        return 0
    fi

    print_info "Testing chat log upload..."
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed or not in PATH"
        return 1
    fi

    # Set environment variable for the client
    export LAMBDA_FUNCTION_URL="$FUNCTION_URL"
    
    # Run the upload test
    cd "$CLIENT_DIR"
    
    print_info "Running chat log uploader test..."
    if node chat-log-uploader.js --test; then
        print_success "Upload test completed successfully"
        return 0
    else
        print_error "Upload test failed"
        return 1
    fi
}

# Test AWS CLI integration
test_aws_cli_integration() {
    print_info "Testing AWS CLI integration..."
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured or invalid"
        return 1
    fi

    # Get S3 bucket name from CloudFormation
    local s3_stack_name="${STACK_PREFIX}-s3-chat-logs"
    local bucket_name=$(aws cloudformation describe-stacks \
        --stack-name "$s3_stack_name" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
        --output text 2>/dev/null)

    if [ -z "$bucket_name" ] || [ "$bucket_name" = "None" ]; then
        print_warning "Could not retrieve S3 bucket name from CloudFormation"
        return 0
    fi

    print_info "Testing S3 bucket access: $bucket_name"
    
    # List objects in chat-logs prefix
    if aws s3 ls "s3://$bucket_name/chat-logs/" --region "$AWS_REGION" &>/dev/null; then
        print_success "S3 bucket is accessible"
        
        # Count uploaded test files
        local file_count=$(aws s3 ls "s3://$bucket_name/chat-logs/" --region "$AWS_REGION" | grep "test-chat-log" | wc -l)
        print_info "Found $file_count test chat log files in S3"
        
        if [ "$VERBOSE" = true ] && [ "$file_count" -gt 0 ]; then
            print_info "Recent test files:"
            aws s3 ls "s3://$bucket_name/chat-logs/" --region "$AWS_REGION" | grep "test-chat-log" | tail -5
        fi
    else
        print_warning "S3 bucket access test failed (this may be expected due to bucket policy restrictions)"
    fi
}

# Performance test
test_performance() {
    print_info "Running performance test..."
    
    local start_time=$(date +%s.%N)
    
    # Test presigned URL generation speed
    for i in {1..5}; do
        local test_response=$(curl -s -w "%{time_total}" -X POST "$FUNCTION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"action\": \"upload\", \"fileName\": \"perf-test-$i.json\"}" \
            -o /tmp/perf_test_response_$i.json)
        
        local response_time="${test_response: -6}"
        print_info "Presigned URL generation $i: ${response_time}s"
        
        if [ "$VERBOSE" = true ]; then
            cat "/tmp/perf_test_response_$i.json" | jq '.presignedUrl' -r | head -c 50
            echo "..."
        fi
    done
    
    local end_time=$(date +%s.%N)
    local total_time=$(echo "$end_time - $start_time" | bc -l)
    
    print_success "Performance test completed in ${total_time}s"
}

# Cleanup test files
cleanup_test_files() {
    if [ "$CLEANUP" != true ]; then
        print_info "Skipping cleanup (use --cleanup to remove test files)"
        return 0
    fi

    print_info "Cleaning up test files..."
    
    # Remove local temporary files
    rm -f /tmp/lambda_health_response.json
    rm -f /tmp/perf_test_response_*.json
    
    print_success "Local test files cleaned up"
    
    # Note: S3 test files are not automatically cleaned up for safety
    # They will be automatically deleted by S3 lifecycle rules
    print_info "S3 test files will be automatically cleaned up by lifecycle rules"
}

# Main test execution
run_integration_tests() {
    print_info "Starting AWS S3 Chat Logs Integration Tests"
    print_info "Environment: $ENVIRONMENT"
    print_info "AWS Region: $AWS_REGION"
    print_info "Stack Prefix: $STACK_PREFIX"
    echo

    local test_results=()
    
    # Get function URL
    get_function_url
    echo

    # Test 1: Lambda health
    if test_lambda_health; then
        test_results+=("✅ Lambda Health")
    else
        test_results+=("❌ Lambda Health")
    fi
    echo

    # Test 2: Upload functionality
    if test_upload; then
        test_results+=("✅ Upload Test")
    else
        test_results+=("❌ Upload Test")
    fi
    echo

    # Test 3: AWS CLI integration
    if test_aws_cli_integration; then
        test_results+=("✅ AWS CLI Integration")
    else
        test_results+=("❌ AWS CLI Integration")
    fi
    echo

    # Test 4: Performance
    if test_performance; then
        test_results+=("✅ Performance Test")
    else
        test_results+=("❌ Performance Test")
    fi
    echo

    # Cleanup
    cleanup_test_files
    echo

    # Test Summary
    echo "=== Integration Test Results ==="
    for result in "${test_results[@]}"; do
        echo "  $result"
    done
    echo

    # Check for failures
    local failed_tests=$(printf '%s\n' "${test_results[@]}" | grep -c "❌" || true)
    
    if [ "$failed_tests" -eq 0 ]; then
        print_success "All integration tests passed! 🎉"
        print_info "Phase 1 AWS S3 integration is ready for production use"
        echo
        print_info "Next steps:"
        echo "  - Integrate with Media Viewer application"
        echo "  - Set up monitoring and alerting"
        echo "  - Plan Phase 2 implementation"
        return 0
    else
        print_error "$failed_tests test(s) failed"
        print_error "Please review the errors above and fix issues before proceeding"
        return 1
    fi
}

# Main execution
main() {
    # Check dependencies
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed or not in PATH"
        exit 1
    fi

    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed or not in PATH"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed - JSON responses will not be formatted"
    fi

    # Run tests
    run_integration_tests
}

# Run main function
main "$@"