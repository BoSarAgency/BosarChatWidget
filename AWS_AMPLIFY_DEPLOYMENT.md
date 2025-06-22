# AWS Amplify Deployment Guide

This guide explains how to deploy the BoSar Chat Widget to AWS Amplify.

## 📋 Prerequisites

1. **AWS Account** with Amplify access
2. **GitHub Repository** with the chat widget code
3. **Domain name** (optional, for custom domain)
4. **Backend API** deployed and accessible via WebSocket

## 🚀 Deployment Steps

### 1. Connect Repository to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Choose **GitHub** as your repository service
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository: `BosarChatWidget`
6. Choose the branch: `main` or `master`

### 2. Configure Build Settings

Amplify will automatically detect the `amplify.yml` file. The configuration includes:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 3. Configuration

The chat widget doesn't use environment variables. Instead, configuration is handled at runtime through the `window.chatWidgetConfig` object when integrating the widget into websites.

**No environment variables are needed for this project.**

### 4. Custom Domain (Optional)

1. Go to **App settings** → **Domain management**
2. Click **"Add domain"**
3. Enter your domain name (e.g., `chat-widget.yourdomain.com`)
4. Follow the DNS configuration instructions
5. Wait for SSL certificate provisioning

### 5. Deploy

1. Click **"Save and deploy"**
2. Monitor the build process in the console
3. Build typically takes 2-5 minutes
4. Once complete, your app will be available at the Amplify URL

## 🔧 Configuration Files

### amplify.yml
Build configuration for AWS Amplify deployment.

### _redirects
Netlify-style redirects file for SPA routing and security headers.

## 🌐 Post-Deployment

### 1. Update WebSocket URL
Make sure your production WebSocket server is accessible and update the environment variable:
```
VITE_WEBSOCKET_URL=wss://your-api-domain.com/chat
```

### 2. Test the Widget
1. Visit your Amplify URL
2. Test the chat widget functionality
3. Verify WebSocket connection
4. Test message sending and receiving

### 3. Integration
Use the deployed widget in other websites:

```html
<script>
  window.chatWidgetConfig = {
    title: 'Customer Support',
    color: '#007bff',
    socketUrl: 'wss://your-api-domain.com',
    startingMessage: 'Hello! How can I help you today?'
  };
</script>
<script src="https://your-amplify-domain.amplifyapp.com/chat-widget.js"></script>
```

## 🔄 Continuous Deployment

Amplify automatically deploys when you push to the connected branch:

1. Push changes to your GitHub repository
2. Amplify detects the changes
3. Automatically triggers a new build
4. Deploys the updated version

## 📊 Monitoring

### Build Logs
- Monitor build status in Amplify Console
- Check build logs for any errors
- Review deployment history

### Performance
- Use AWS CloudWatch for monitoring
- Check Core Web Vitals in Amplify Console
- Monitor WebSocket connection metrics

## 🛡️ Security

### HTTPS/WSS
- Amplify provides HTTPS by default
- Ensure your WebSocket server supports WSS (secure WebSocket)
- Update CORS settings on your API server

### Content Security Policy
The `_redirects` file includes basic CSP headers. Customize as needed:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss://your-api-domain.com;
```

## 🚨 Troubleshooting

### Build Failures
1. Check Node.js version compatibility
2. Verify all dependencies are in package.json
3. Check build logs for specific errors

### WebSocket Connection Issues
1. Verify WSS URL is correct
2. Check CORS configuration on API server
3. Ensure WebSocket server is accessible from browser

### Widget Not Loading
1. Check browser console for errors
2. Verify chat-widget.js is accessible
3. Check CSP headers aren't blocking scripts

## 📞 Support

For deployment issues:
1. Check AWS Amplify documentation
2. Review build logs in Amplify Console
3. Test locally with `npm run build` first

## 🎉 Success!

Your chat widget is now deployed on AWS Amplify with:
- ✅ Automatic HTTPS
- ✅ Global CDN distribution
- ✅ Continuous deployment
- ✅ Custom domain support
- ✅ Environment-specific configuration
