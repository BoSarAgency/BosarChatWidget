# S3 Deployment Guide

This guide explains how to deploy the BoSar Chat Widget to Amazon S3 for static hosting.

## 📋 Prerequisites

1. **AWS Account** with S3 access
2. **AWS CLI** installed and configured
3. **S3 Bucket** created: `bosar-widget` in `us-west-1` region
4. **Node.js** and npm installed

## 🪣 S3 Bucket Setup

### 1. Create S3 Bucket (if not exists)

```bash
# Create bucket in us-west-1
aws s3 mb s3://bosar-widget --region us-west-1

# Enable versioning (optional)
aws s3api put-bucket-versioning \
  --bucket bosar-widget \
  --versioning-configuration Status=Enabled
```

### 2. Configure Bucket for Static Website Hosting

The deployment script will automatically configure this, but you can also do it manually:

```bash
# Enable static website hosting
aws s3api put-bucket-website \
  --bucket bosar-widget \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'
```

## 🚀 Deployment Methods

### Method 1: Node.js Script (Recommended)

Cross-platform deployment script with full automation:

```bash
# Deploy with default AWS profile
npm run deploy:s3

# Or run directly
node deploy-s3.js

# Deploy with specific AWS profile
node deploy-s3.js --profile myprofile

# Deploy using environment variable
AWS_PROFILE=production npm run deploy:s3
```

### Method 2: Bash Script (Linux/Mac)

```bash
# Make script executable
chmod +x deploy-s3.sh

# Deploy
./deploy-s3.sh

# Deploy with specific profile
./deploy-s3.sh --profile myprofile

# Dry run (see what would be deployed)
./deploy-s3.sh --dry-run
```

### Method 3: Windows Batch Script

```cmd
# Run the batch script
deploy-s3.bat
```

## 🔧 Deployment Scripts Features

### Automated Tasks
- ✅ **Pre-flight checks** - AWS CLI, credentials, bucket access
- ✅ **Project build** - Runs `npm run build:production`
- ✅ **File optimization** - Sets appropriate cache headers
- ✅ **Public access** - Configures bucket policy for public read
- ✅ **Website hosting** - Enables S3 static website hosting
- ✅ **Content types** - Sets correct MIME types for all files

### Cache Strategy
- **Static assets** (JS, CSS, images): 1 year cache (`max-age=31536000`)
- **HTML files**: No cache (`max-age=0, must-revalidate`)
- **JSON files**: 1 hour cache (`max-age=3600`)
- **chat-widget.js**: 1 day cache (`max-age=86400`)

### Security
- **Public read access** for all files
- **HTTPS enforcement** via CloudFront (optional)
- **CORS headers** for cross-origin requests

## 📁 Deployed Files Structure

After deployment, your S3 bucket will contain:

```
bosar-widget/
├── index.html                 # Main demo page
├── chat-widget.js            # Standalone widget script
├── assets/
│   ├── main-[hash].js        # Demo app JavaScript
│   ├── widget-[hash].css     # Widget styles
│   └── main-[hash].css       # Demo app styles
└── vite.svg                  # Favicon
```

## 🌐 Access URLs

After deployment, your widget will be available at:

### S3 Website URL
```
http://bosar-widget.s3-website-us-west-1.amazonaws.com
```

### S3 Direct URL
```
https://s3-us-west-1.amazonaws.com/bosar-widget/index.html
```

### Widget Integration URL
```
https://s3-us-west-1.amazonaws.com/bosar-widget/chat-widget.js
```

## 🔗 Widget Integration

After deployment, integrate the widget into any website:

```html
<!-- Configure the widget -->
<script>
  window.chatWidgetConfig = {
    title: "Bosar Agency",
    color: "#75080D",
    startingMessage: "Hello! How can I help you today?",
    socketUrl: "wss://api.bosar.click/chat",
    botId: "55399af4-a571-4eb3-af02-3c0201876478"
  };
</script>

<!-- Load the widget from S3 -->
<script src="https://s3-us-west-1.amazonaws.com/bosar-widget/chat-widget.js"></script>
```

## 🚀 CloudFront Distribution (Optional)

For better performance and HTTPS, create a CloudFront distribution:

### 1. Create Distribution

```bash
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "bosar-widget-'$(date +%s)'",
    "Comment": "BoSar Chat Widget Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "S3-bosar-widget",
        "DomainName": "bosar-widget.s3-us-west-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-bosar-widget",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {"Forward": "none"}
      }
    },
    "Enabled": true
  }'
```

### 2. Update Integration

Use CloudFront URL instead of S3 direct URL:

```html
<script src="https://d1234567890.cloudfront.net/chat-widget.js"></script>
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/s3-deploy.yml`:

```yaml
name: Deploy to S3

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Deploy to S3
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: us-west-1
      run: npm run deploy:s3
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. AWS CLI Not Found
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### 2. Access Denied
```bash
# Check AWS credentials
aws sts get-caller-identity

# Configure credentials
aws configure
```

#### 3. Bucket Not Found
```bash
# Create bucket
aws s3 mb s3://bosar-widget --region us-west-1
```

#### 4. Build Fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+ for Vite
```

### Verification Commands

```bash
# Check bucket contents
aws s3 ls s3://bosar-widget/ --recursive

# Check bucket policy
aws s3api get-bucket-policy --bucket bosar-widget

# Check website configuration
aws s3api get-bucket-website --bucket bosar-widget

# Test widget loading
curl -I https://s3-us-west-1.amazonaws.com/bosar-widget/chat-widget.js
```

## 📊 Monitoring

### CloudWatch Metrics
- **Bucket requests** - Monitor GET/PUT requests
- **Data transfer** - Track bandwidth usage
- **Error rates** - Monitor 4xx/5xx errors

### Cost Optimization
- **S3 storage** - Standard storage for active files
- **CloudFront** - Reduce S3 requests and improve performance
- **Lifecycle policies** - Archive old versions

## 🎉 Success!

Your chat widget is now deployed to S3 with:
- ✅ **Global accessibility** via S3 static hosting
- ✅ **Optimized caching** for performance
- ✅ **Public access** for easy integration
- ✅ **Automated deployment** scripts
- ✅ **Cross-platform** deployment support

**Integration URL:** `https://s3-us-west-1.amazonaws.com/bosar-widget/chat-widget.js`
