# AWS Amplify Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ Repository Setup
- [ ] Code is committed to GitHub repository
- [ ] `amplify.yml` build configuration is present
- [ ] `_redirects` file is in public folder
- [ ] Package.json scripts are updated

### ✅ Backend Configuration
- [ ] WebSocket URLs are accessible and support WSS
- [ ] API endpoints are CORS-enabled for your domain
- [ ] WebSocket server is properly configured

### ✅ Build Testing
- [ ] `npm run build` completes successfully
- [ ] `npm run preview` works locally
- [ ] All assets are generated in `dist/` folder
- [ ] `chat-widget.js` is present and functional

## 🚀 AWS Amplify Setup

### ✅ Initial Setup
- [ ] AWS account with Amplify access
- [ ] GitHub repository connected to Amplify
- [ ] Build settings configured (uses amplify.yml)

### ✅ Configuration Notes
**No environment variables are required** - the widget uses runtime configuration via `window.chatWidgetConfig` when integrated into websites.

### ✅ Domain Configuration (Optional)
- [ ] Custom domain added in Amplify
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] Domain verification completed

## 🔧 Backend Requirements

### ✅ WebSocket Server
- [ ] WebSocket server supports WSS (secure WebSocket)
- [ ] CORS configured to allow your Amplify domain
- [ ] Server accessible from public internet
- [ ] Health check endpoint available

### ✅ API Server
- [ ] HTTPS enabled
- [ ] CORS headers configured
- [ ] Rate limiting implemented
- [ ] Error handling in place

## 🧪 Testing Checklist

### ✅ Pre-Deployment Testing
- [ ] Widget loads correctly locally
- [ ] WebSocket connection works
- [ ] Messages send and receive properly
- [ ] Loading indicators work
- [ ] Error handling functions
- [ ] Responsive design on mobile

### ✅ Post-Deployment Testing
- [ ] Widget loads on Amplify URL
- [ ] WebSocket connects to production server
- [ ] Real-time messaging works
- [ ] AI responses are received
- [ ] Connection indicators work
- [ ] Error messages display properly
- [ ] Performance is acceptable

## 🛡️ Security Checklist

### ✅ HTTPS/WSS
- [ ] All connections use secure protocols
- [ ] Mixed content warnings resolved
- [ ] Certificate chain is valid

### ✅ Content Security Policy
- [ ] CSP headers configured in _redirects
- [ ] WebSocket connections allowed
- [ ] Script sources whitelisted

### ✅ CORS Configuration
- [ ] API server allows Amplify domain
- [ ] WebSocket server allows connections
- [ ] Preflight requests handled

## 📊 Monitoring Setup

### ✅ AWS CloudWatch
- [ ] Amplify metrics enabled
- [ ] Build notifications configured
- [ ] Error tracking set up

### ✅ Application Monitoring
- [ ] Console error tracking
- [ ] WebSocket connection monitoring
- [ ] Performance metrics collection

## 🔄 Deployment Process

### ✅ Initial Deployment
1. [ ] Connect GitHub repository to Amplify
2. [ ] Configure build settings
3. [ ] Set environment variables
4. [ ] Trigger first deployment
5. [ ] Verify deployment success
6. [ ] Test all functionality

### ✅ Continuous Deployment
1. [ ] Push changes to main branch
2. [ ] Monitor build in Amplify Console
3. [ ] Verify automatic deployment
4. [ ] Test updated functionality
5. [ ] Monitor for any issues

## 🚨 Rollback Plan

### ✅ Rollback Preparation
- [ ] Previous working version identified
- [ ] Rollback procedure documented
- [ ] Database migration rollback plan (if applicable)
- [ ] DNS rollback plan (if using custom domain)

### ✅ Emergency Contacts
- [ ] AWS support contact information
- [ ] Development team contact list
- [ ] Escalation procedures documented

## 📞 Post-Deployment

### ✅ Documentation Updates
- [ ] Update integration documentation
- [ ] Update API documentation
- [ ] Update user guides
- [ ] Update troubleshooting guides

### ✅ Team Notification
- [ ] Notify stakeholders of deployment
- [ ] Share new URLs and endpoints
- [ ] Provide testing instructions
- [ ] Schedule post-deployment review

## ✅ Success Criteria

### ✅ Functional Requirements
- [ ] Widget loads within 3 seconds
- [ ] WebSocket connects within 5 seconds
- [ ] Messages send/receive in real-time
- [ ] AI responses work correctly
- [ ] Error handling is graceful
- [ ] Mobile experience is smooth

### ✅ Performance Requirements
- [ ] Page load time < 3 seconds
- [ ] Widget bundle size < 500KB
- [ ] WebSocket latency < 200ms
- [ ] 99.9% uptime target
- [ ] Core Web Vitals pass

### ✅ Security Requirements
- [ ] All connections use HTTPS/WSS
- [ ] No mixed content warnings
- [ ] CSP headers prevent XSS
- [ ] No sensitive data in client code
- [ ] Rate limiting prevents abuse

## 🎉 Deployment Complete!

Once all items are checked:
- [ ] Deployment is successful
- [ ] All tests pass
- [ ] Monitoring is active
- [ ] Documentation is updated
- [ ] Team is notified

**Amplify URL:** `https://[app-id].amplifyapp.com`
**Custom Domain:** `https://your-custom-domain.com` (if configured)
**Widget Integration:** Use the deployed chat-widget.js in your websites
