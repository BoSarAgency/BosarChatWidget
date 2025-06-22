# Quick S3 Deployment Guide

## 🚀 Deploy to S3 in 3 Steps

### 1. Prerequisites
- AWS CLI installed: `aws --version`
- AWS credentials configured: `aws configure`
- S3 bucket exists: `bosar-widget` in `us-west-1`

### 2. Deploy
```bash
# Deploy with default AWS profile
npm run deploy:s3

# Or deploy with specific profile
npm run deploy:s3 -- --profile myprofile

# Or run directly
node deploy-s3.js
```

### 3. Verify
```bash
# Verify deployment
npm run verify:s3

# Or run directly
node verify-deployment.js
```

## 🔧 Alternative Methods

### Bash Script (Linux/Mac)
```bash
./deploy-s3.sh
```

### Windows Batch
```cmd
deploy-s3.bat
```

### Direct Node.js
```bash
# With specific profile
node deploy-s3.js --profile production

# With environment variable
AWS_PROFILE=production node deploy-s3.js
```

## 🌐 After Deployment

Your widget will be available at:
- **Widget URL**: `https://s3-us-west-1.amazonaws.com/bosar-widget/chat-widget.js`
- **Demo URL**: `http://bosar-widget.s3-website-us-west-1.amazonaws.com`

## 🔗 Integration

```html
<script>
  window.chatWidgetConfig = {
    title: 'Customer Support',
    color: '#007bff',
    socketUrl: 'wss://your-api-domain.com',
    startingMessage: 'Hello! How can I help you today?'
  };
</script>
<script src="https://s3-us-west-1.amazonaws.com/bosar-widget/chat-widget.js"></script>
```

## 🛠️ Troubleshooting

### AWS CLI Not Found
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Credentials Not Configured
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region (us-west-1), and output format (json)
```

### Bucket Doesn't Exist
```bash
# Create bucket
aws s3 mb s3://bosar-widget --region us-west-1
```

### Permission Denied
Make sure your AWS user has these permissions:
- `s3:GetObject`
- `s3:PutObject`
- `s3:DeleteObject`
- `s3:ListBucket`
- `s3:PutBucketPolicy`
- `s3:PutBucketWebsite`

## ✅ Success Indicators

After running `npm run deploy:s3`, you should see:
- ✅ AWS CLI is installed
- ✅ AWS credentials are valid
- ✅ Bucket 'bosar-widget' is accessible
- ✅ Project built successfully
- ✅ Files deployed to S3
- ✅ Bucket policy set for public read access
- ✅ Static website hosting enabled
- 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!

## 📋 Quick Commands Reference

```bash
# Deploy
npm run deploy:s3

# Verify
npm run verify:s3

# Build only
npm run build:production

# Preview locally
npm run preview:production
```
