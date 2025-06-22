@echo off
REM BoSar Chat Widget S3 Deployment Script for Windows
REM Deploys the chat widget to S3 bucket: bosar-widget (us-west-1)

setlocal enabledelayedexpansion

REM Configuration
set BUCKET_NAME=bosar-widget
set REGION=us-west-1
set DIST_DIR=dist
set PROFILE=

REM Check if AWS CLI is installed
echo [INFO] Checking AWS CLI installation...
aws --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] AWS CLI is not installed. Please install it first.
    echo Install from: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
    exit /b 1
)
echo [SUCCESS] AWS CLI is installed

REM Check AWS credentials
echo [INFO] Checking AWS credentials...
aws sts get-caller-identity %PROFILE% >nul 2>&1
if errorlevel 1 (
    echo [ERROR] AWS credentials not configured or invalid.
    echo Run 'aws configure' to set up your credentials.
    exit /b 1
)
echo [SUCCESS] AWS credentials are valid

REM Check if bucket exists
echo [INFO] Checking bucket accessibility...
aws s3 ls "s3://%BUCKET_NAME%" %PROFILE% --region %REGION% >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Bucket '%BUCKET_NAME%' does not exist or is not accessible.
    echo Please create the bucket or check your permissions.
    exit /b 1
)
echo [SUCCESS] Bucket '%BUCKET_NAME%' is accessible

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found. Are you in the correct directory?
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
)

REM Build the project
echo [INFO] Building the project...
npm run build:production
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)

if not exist "%DIST_DIR%" (
    echo [ERROR] Build failed. %DIST_DIR% directory not found.
    exit /b 1
)
echo [SUCCESS] Project built successfully

REM Deploy to S3
echo [INFO] Deploying files to S3 bucket: %BUCKET_NAME%

REM Sync all files except HTML and JSON with long cache
aws s3 sync %DIST_DIR%/ s3://%BUCKET_NAME%/ ^
    %PROFILE% ^
    --region %REGION% ^
    --delete ^
    --exact-timestamps ^
    --cache-control "public, max-age=31536000" ^
    --exclude "*.html" ^
    --exclude "*.json"

if errorlevel 1 (
    echo [ERROR] Failed to sync files to S3
    exit /b 1
)

REM Upload HTML files with shorter cache
aws s3 sync %DIST_DIR%/ s3://%BUCKET_NAME%/ ^
    %PROFILE% ^
    --region %REGION% ^
    --cache-control "public, max-age=0, must-revalidate" ^
    --content-type "text/html" ^
    --include "*.html"

REM Upload JSON files with medium cache
aws s3 sync %DIST_DIR%/ s3://%BUCKET_NAME%/ ^
    %PROFILE% ^
    --region %REGION% ^
    --cache-control "public, max-age=3600" ^
    --content-type "application/json" ^
    --include "*.json"

REM Set specific content type for chat-widget.js
if exist "%DIST_DIR%\chat-widget.js" (
    aws s3 cp %DIST_DIR%/chat-widget.js s3://%BUCKET_NAME%/chat-widget.js ^
        %PROFILE% ^
        --region %REGION% ^
        --content-type "application/javascript" ^
        --cache-control "public, max-age=86400" ^
        --metadata-directive REPLACE
)

echo [SUCCESS] Files deployed to S3

REM Create and apply bucket policy
echo [INFO] Setting bucket policy for public read access...

echo { > bucket-policy.json
echo     "Version": "2012-10-17", >> bucket-policy.json
echo     "Statement": [ >> bucket-policy.json
echo         { >> bucket-policy.json
echo             "Sid": "PublicReadGetObject", >> bucket-policy.json
echo             "Effect": "Allow", >> bucket-policy.json
echo             "Principal": "*", >> bucket-policy.json
echo             "Action": "s3:GetObject", >> bucket-policy.json
echo             "Resource": "arn:aws:s3:::%BUCKET_NAME%/*" >> bucket-policy.json
echo         } >> bucket-policy.json
echo     ] >> bucket-policy.json
echo } >> bucket-policy.json

aws s3api put-bucket-policy ^
    --bucket %BUCKET_NAME% ^
    --policy file://bucket-policy.json ^
    %PROFILE% ^
    --region %REGION%

if errorlevel 1 (
    echo [WARNING] Failed to set bucket policy. You may need to set it manually.
) else (
    echo [SUCCESS] Bucket policy set for public read access
)

del bucket-policy.json

REM Enable static website hosting
echo [INFO] Enabling static website hosting...
aws s3api put-bucket-website ^
    --bucket %BUCKET_NAME% ^
    --website-configuration "{\"IndexDocument\":{\"Suffix\":\"index.html\"},\"ErrorDocument\":{\"Key\":\"index.html\"}}" ^
    %PROFILE% ^
    --region %REGION%

if errorlevel 1 (
    echo [WARNING] Failed to enable website hosting. You may need to enable it manually.
) else (
    echo [SUCCESS] Static website hosting enabled
)

REM Show deployment information
echo.
echo ======================================
echo 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ======================================
echo.
echo 📦 Bucket: %BUCKET_NAME%
echo 🌍 Region: %REGION%
echo 🔗 S3 Website URL: http://%BUCKET_NAME%.s3-website-%REGION%.amazonaws.com
echo 🔗 S3 Direct URL: https://s3-%REGION%.amazonaws.com/%BUCKET_NAME%/index.html
echo.
echo 📋 Integration Instructions:
echo Use this script tag to integrate the widget:
echo.
echo ^<script^>
echo   window.chatWidgetConfig = {
echo     title: 'Customer Support',
echo     color: '#007bff',
echo     socketUrl: 'wss://your-api-domain.com',
echo     startingMessage: 'Hello! How can I help you today?'
echo   };
echo ^</script^>
echo ^<script src="https://s3-%REGION%.amazonaws.com/%BUCKET_NAME%/chat-widget.js"^>^</script^>
echo.
echo 🔧 Files deployed:
aws s3 ls s3://%BUCKET_NAME%/ %PROFILE% --region %REGION% --recursive --human-readable --summarize

echo.
echo Deployment completed successfully!
pause
