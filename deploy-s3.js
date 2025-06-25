#!/usr/bin/env node

/**
 * BoSar Chat Widget S3 Deployment Script (Node.js)
 * Cross-platform deployment to S3 bucket: bosar-widget (us-west-1)
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    bucketName: "bosar-widget",
    region: "us-west-1",
    distDir: "dist",
    profile: process.env.AWS_PROFILE || "",
};

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
};

// Utility functions
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) =>
        console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) =>
        console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// Execute command with error handling
function execCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            encoding: "utf8",
            stdio: options.silent ? "pipe" : "inherit",
            ...options,
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message, code: error.status };
    }
}

// Check if AWS CLI is installed
function checkAwsCli() {
    log.info("Checking AWS CLI installation...");
    const result = execCommand("aws --version", { silent: true });

    if (!result.success) {
        log.error("AWS CLI is not installed. Please install it first.");
        console.log(
            "Install instructions: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        );
        process.exit(1);
    }

    log.success("AWS CLI is installed");
}

// Check AWS credentials
function checkAwsCredentials() {
    log.info("Checking AWS credentials...");
    const profileFlag = CONFIG.profile ? `--profile ${CONFIG.profile}` : "";
    const result = execCommand(`aws sts get-caller-identity ${profileFlag}`, {
        silent: true,
    });

    if (!result.success) {
        log.error("AWS credentials not configured or invalid.");
        console.log("Run 'aws configure' to set up your credentials.");
        process.exit(1);
    }

    log.success("AWS credentials are valid");
}

// Check if bucket exists and is accessible
function checkBucket() {
    log.info(`Checking bucket '${CONFIG.bucketName}' accessibility...`);
    const profileFlag = CONFIG.profile ? `--profile ${CONFIG.profile}` : "";
    const result = execCommand(
        `aws s3 ls "s3://${CONFIG.bucketName}" ${profileFlag} --region ${CONFIG.region}`,
        { silent: true }
    );

    if (!result.success) {
        log.error(
            `Bucket '${CONFIG.bucketName}' does not exist or is not accessible.`
        );
        console.log("Please create the bucket or check your permissions.");
        process.exit(1);
    }

    log.success(`Bucket '${CONFIG.bucketName}' is accessible`);
}

// Build the project
function buildProject() {
    log.info("Building the project...");

    if (!fs.existsSync("package.json")) {
        log.error("package.json not found. Are you in the correct directory?");
        process.exit(1);
    }

    // Install dependencies if node_modules doesn't exist
    if (!fs.existsSync("node_modules")) {
        log.info("Installing dependencies...");
        const installResult = execCommand("npm install");
        if (!installResult.success) {
            log.error("Failed to install dependencies");
            process.exit(1);
        }
    }

    // Build the project
    const buildResult = execCommand("npm run build:production");
    if (!buildResult.success) {
        log.error("Build failed");
        process.exit(1);
    }

    if (!fs.existsSync(CONFIG.distDir)) {
        log.error(`Build failed. ${CONFIG.distDir} directory not found.`);
        process.exit(1);
    }

    log.success("Project built successfully");
}

// Deploy files to S3
function deployToS3() {
    log.info(`Deploying files to S3 bucket: ${CONFIG.bucketName}`);
    const profileFlag = CONFIG.profile ? `--profile ${CONFIG.profile}` : "";

    // Sync all files except HTML and JSON with long cache
    const syncResult1 = execCommand(
        `
    aws s3 sync ${CONFIG.distDir}/ s3://${CONFIG.bucketName}/ 
    ${profileFlag} 
    --region ${CONFIG.region} 
    --delete 
    --exact-timestamps 
    --cache-control "public, max-age=31536000" 
    --exclude "*.html" 
    --exclude "*.json"
  `
            .replace(/\s+/g, " ")
            .trim()
    );

    if (!syncResult1.success) {
        log.error("Failed to sync files to S3");
        process.exit(1);
    }

    // Upload HTML files with shorter cache
    execCommand(
        `
    aws s3 sync ${CONFIG.distDir}/ s3://${CONFIG.bucketName}/ 
    ${profileFlag} 
    --region ${CONFIG.region} 
    --cache-control "public, max-age=0, must-revalidate" 
    --content-type "text/html" 
    --include "*.html"
  `
            .replace(/\s+/g, " ")
            .trim()
    );

    // Upload JSON files with medium cache
    execCommand(
        `
    aws s3 sync ${CONFIG.distDir}/ s3://${CONFIG.bucketName}/ 
    ${profileFlag} 
    --region ${CONFIG.region} 
    --cache-control "public, max-age=3600" 
    --content-type "application/json" 
    --include "*.json"
  `
            .replace(/\s+/g, " ")
            .trim()
    );

    // Set specific content type for chat-widget.js
    const widgetPath = path.join(CONFIG.distDir, "chat-widget.js");
    if (fs.existsSync(widgetPath)) {
        execCommand(
            `
      aws s3 cp ${widgetPath} s3://${CONFIG.bucketName}/chat-widget.js 
      ${profileFlag} 
      --region ${CONFIG.region} 
      --content-type "application/javascript" 
      --cache-control "public, max-age=86400" 
      --metadata-directive REPLACE
    `
                .replace(/\s+/g, " ")
                .trim()
        );
    }

    log.success("Files deployed to S3");
}

// Set bucket policy for public read access
function setBucketPolicy() {
    log.info("Setting bucket policy for public read access...");

    const bucketPolicy = {
        Version: "2012-10-17",
        Statement: [
            {
                Sid: "PublicReadGetObject",
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                Resource: `arn:aws:s3:::${CONFIG.bucketName}/*`,
            },
        ],
    };

    const policyFile = "bucket-policy.json";
    fs.writeFileSync(policyFile, JSON.stringify(bucketPolicy, null, 2));

    const profileFlag = CONFIG.profile ? `--profile ${CONFIG.profile}` : "";
    const result = execCommand(
        `
    aws s3api put-bucket-policy 
    --bucket ${CONFIG.bucketName} 
    --policy file://${policyFile} 
    ${profileFlag} 
    --region ${CONFIG.region}
  `
            .replace(/\s+/g, " ")
            .trim()
    );

    // Clean up policy file
    fs.unlinkSync(policyFile);

    if (!result.success) {
        log.warning(
            "Failed to set bucket policy. You may need to set it manually."
        );
    } else {
        log.success("Bucket policy set for public read access");
    }
}

// Enable static website hosting
function enableWebsiteHosting() {
    log.info("Enabling static website hosting...");

    const websiteConfig = {
        IndexDocument: { Suffix: "index.html" },
        ErrorDocument: { Key: "index.html" },
    };

    const profileFlag = CONFIG.profile ? `--profile ${CONFIG.profile}` : "";
    const result = execCommand(
        `
    aws s3api put-bucket-website 
    --bucket ${CONFIG.bucketName} 
    --website-configuration '${JSON.stringify(websiteConfig)}' 
    ${profileFlag} 
    --region ${CONFIG.region}
  `
            .replace(/\s+/g, " ")
            .trim()
    );

    if (!result.success) {
        log.warning(
            "Failed to enable website hosting. You may need to enable it manually."
        );
    } else {
        log.success("Static website hosting enabled");
    }
}

// Display deployment information
function showDeploymentInfo() {
    console.log("\n======================================");
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("======================================\n");

    console.log(`📦 Bucket: ${CONFIG.bucketName}`);
    console.log(`🌍 Region: ${CONFIG.region}`);
    console.log(
        `🔗 S3 Website URL: http://${CONFIG.bucketName}.s3-website-${CONFIG.region}.amazonaws.com`
    );
    console.log(
        `🔗 S3 Direct URL: https://s3-${CONFIG.region}.amazonaws.com/${CONFIG.bucketName}/index.html\n`
    );

    console.log("📋 Integration Instructions:");
    console.log("Use this script tag to integrate the widget:\n");
    console.log("<script>");
    console.log("  window.chatWidgetConfig = {");
    console.log("    title: 'Customer Support',");
    console.log("    color: '#75080D',");
    console.log("    socketUrl: 'wss://api.bosar.click/chat',");
    console.log("    botId: '55399af4-a571-4eb3-af02-3c0201876478',");
    console.log("    startingMessage: 'Hello! How can I help you today?'");
    console.log("  };");
    console.log("</script>");
    console.log(
        `<script src="https://s3-${CONFIG.region}.amazonaws.com/${CONFIG.bucketName}/chat-widget.js"></script>\n`
    );

    console.log("🔧 Files deployed:");
    const profileFlag = CONFIG.profile ? `--profile ${CONFIG.profile}` : "";
    execCommand(
        `aws s3 ls s3://${CONFIG.bucketName}/ ${profileFlag} --region ${CONFIG.region} --recursive --human-readable --summarize`
    );
}

// Main deployment function
function main() {
    console.log("======================================");
    console.log("🚀 BoSar Chat Widget S3 Deployment");
    console.log("======================================\n");

    // Pre-flight checks
    log.info("Running pre-flight checks...");
    checkAwsCli();
    checkAwsCredentials();
    checkBucket();

    // Build and deploy
    buildProject();
    deployToS3();
    setBucketPolicy();
    enableWebsiteHosting();

    // Show results
    showDeploymentInfo();
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
    console.log("BoSar Chat Widget S3 Deployment Script\n");
    console.log("Usage: node deploy-s3.js [options]\n");
    console.log("Options:");
    console.log("  --help, -h     Show this help message");
    console.log("  --profile      AWS profile to use");
    console.log("\nEnvironment Variables:");
    console.log("  AWS_PROFILE    AWS profile to use\n");
    console.log("Examples:");
    console.log(
        "  node deploy-s3.js                    # Deploy using default AWS profile"
    );
    console.log(
        "  node deploy-s3.js --profile myprofile # Deploy using specific AWS profile"
    );
    console.log(
        "  AWS_PROFILE=prod node deploy-s3.js   # Deploy using environment variable"
    );
    process.exit(0);
}

const profileIndex = args.indexOf("--profile");
if (profileIndex !== -1 && args[profileIndex + 1]) {
    CONFIG.profile = args[profileIndex + 1];
}

// Run the deployment
main();
