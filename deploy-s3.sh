#!/bin/bash

# BoSar Chat Widget S3 Deployment Script
# Deploys the chat widget to S3 bucket: bosar-widget (us-west-1)

set -e  # Exit on any error

# Configuration
BUCKET_NAME="bosar-widget"
REGION="us-west-1"
DIST_DIR="dist"
PROFILE=""  # Add AWS profile name if needed, e.g., PROFILE="--profile myprofile"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        echo "Install instructions: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI is installed"
}

# Function to check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity $PROFILE &> /dev/null; then
        print_error "AWS credentials not configured or invalid."
        echo "Run 'aws configure' to set up your credentials."
        exit 1
    fi
    print_success "AWS credentials are valid"
}

# Function to check if bucket exists
check_bucket() {
    if ! aws s3 ls "s3://$BUCKET_NAME" $PROFILE --region $REGION &> /dev/null; then
        print_error "Bucket '$BUCKET_NAME' does not exist or is not accessible."
        echo "Please create the bucket or check your permissions."
        exit 1
    fi
    print_success "Bucket '$BUCKET_NAME' is accessible"
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Build the project
    npm run build:production
    
    if [ ! -d "$DIST_DIR" ]; then
        print_error "Build failed. $DIST_DIR directory not found."
        exit 1
    fi
    
    print_success "Project built successfully"
}

# Function to sync files to S3
deploy_to_s3() {
    print_status "Deploying files to S3 bucket: $BUCKET_NAME"
    
    # Sync all files from dist directory
    aws s3 sync $DIST_DIR/ s3://$BUCKET_NAME/ \
        $PROFILE \
        --region $REGION \
        --delete \
        --exact-timestamps \
        --cache-control "public, max-age=31536000" \
        --exclude "*.html" \
        --exclude "*.json"
    
    # Upload HTML files with shorter cache (for SPA routing)
    aws s3 sync $DIST_DIR/ s3://$BUCKET_NAME/ \
        $PROFILE \
        --region $REGION \
        --cache-control "public, max-age=0, must-revalidate" \
        --content-type "text/html" \
        --include "*.html"
    
    # Upload JSON files with shorter cache
    aws s3 sync $DIST_DIR/ s3://$BUCKET_NAME/ \
        $PROFILE \
        --region $REGION \
        --cache-control "public, max-age=3600" \
        --content-type "application/json" \
        --include "*.json"
    
    # Set specific content types and cache for key files
    if [ -f "$DIST_DIR/chat-widget.js" ]; then
        aws s3 cp $DIST_DIR/chat-widget.js s3://$BUCKET_NAME/chat-widget.js \
            $PROFILE \
            --region $REGION \
            --content-type "application/javascript" \
            --cache-control "public, max-age=86400" \
            --metadata-directive REPLACE
    fi
    
    print_success "Files deployed to S3"
}

# Function to set bucket policy for public read access
set_bucket_policy() {
    print_status "Setting bucket policy for public read access..."
    
    # Create bucket policy JSON
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF
    
    # Apply bucket policy
    aws s3api put-bucket-policy \
        --bucket $BUCKET_NAME \
        --policy file://bucket-policy.json \
        $PROFILE \
        --region $REGION
    
    # Clean up policy file
    rm bucket-policy.json
    
    print_success "Bucket policy set for public read access"
}

# Function to enable static website hosting
enable_website_hosting() {
    print_status "Enabling static website hosting..."
    
    aws s3api put-bucket-website \
        --bucket $BUCKET_NAME \
        --website-configuration '{
            "IndexDocument": {"Suffix": "index.html"},
            "ErrorDocument": {"Key": "index.html"}
        }' \
        $PROFILE \
        --region $REGION
    
    print_success "Static website hosting enabled"
}

# Function to display deployment information
show_deployment_info() {
    echo ""
    echo "======================================"
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "======================================"
    echo ""
    echo "📦 Bucket: $BUCKET_NAME"
    echo "🌍 Region: $REGION"
    echo "🔗 S3 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
    echo "🔗 S3 Direct URL: https://s3-$REGION.amazonaws.com/$BUCKET_NAME/index.html"
    echo ""
    echo "📋 Integration Instructions:"
    echo "Use this script tag to integrate the widget:"
    echo ""
    echo "<script>"
    echo "  window.chatWidgetConfig = {"
    echo "    title: 'Customer Support',"
    echo "    color: '#007bff',"
    echo "    socketUrl: 'wss://your-api-domain.com',"
    echo "    startingMessage: 'Hello! How can I help you today?'"
    echo "  };"
    echo "</script>"
    echo "<script src=\"https://s3-$REGION.amazonaws.com/$BUCKET_NAME/chat-widget.js\"></script>"
    echo ""
    echo "🔧 Files deployed:"
    aws s3 ls s3://$BUCKET_NAME/ $PROFILE --region $REGION --recursive --human-readable --summarize
}

# Main deployment function
main() {
    echo "======================================"
    echo "🚀 BoSar Chat Widget S3 Deployment"
    echo "======================================"
    echo ""
    
    # Pre-flight checks
    print_status "Running pre-flight checks..."
    check_aws_cli
    check_aws_credentials
    check_bucket
    
    # Build and deploy
    build_project
    deploy_to_s3
    set_bucket_policy
    enable_website_hosting
    
    # Show results
    show_deployment_info
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "BoSar Chat Widget S3 Deployment Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --dry-run      Show what would be deployed without actually deploying"
        echo "  --profile      AWS profile to use (default: default profile)"
        echo ""
        echo "Environment Variables:"
        echo "  AWS_PROFILE    AWS profile to use"
        echo ""
        echo "Examples:"
        echo "  $0                    # Deploy using default AWS profile"
        echo "  $0 --profile myprofile # Deploy using specific AWS profile"
        echo "  AWS_PROFILE=prod $0   # Deploy using environment variable"
        exit 0
        ;;
    --dry-run)
        print_status "DRY RUN MODE - No files will be uploaded"
        PROFILE="$PROFILE --dryrun"
        main
        ;;
    --profile)
        if [ -z "${2:-}" ]; then
            print_error "Profile name required after --profile"
            exit 1
        fi
        PROFILE="--profile $2"
        main
        ;;
    "")
        # Check for AWS_PROFILE environment variable
        if [ ! -z "${AWS_PROFILE:-}" ]; then
            PROFILE="--profile $AWS_PROFILE"
        fi
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
