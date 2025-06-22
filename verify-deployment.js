#!/usr/bin/env node

/**
 * BoSar Chat Widget Deployment Verification Script
 * Verifies that the widget is properly deployed and accessible
 */

import https from "https";
import http from "http";

const CONFIG = {
    bucketName: "bosar-widget",
    region: "us-west-1",
    files: ["index.html", "chat-widget.js", "vite.svg"],
};

const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
};

const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) =>
        console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) =>
        console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// Check if URL is accessible
function checkUrl(url, expectedContentType = null) {
    return new Promise((resolve) => {
        const client = url.startsWith("https:") ? https : http;

        const req = client.get(url, (res) => {
            const { statusCode, headers } = res;

            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                const result = {
                    url,
                    statusCode,
                    contentType: headers["content-type"],
                    contentLength: headers["content-length"],
                    cacheControl: headers["cache-control"],
                    accessible: statusCode >= 200 && statusCode < 300,
                    size: data.length,
                };

                if (
                    expectedContentType &&
                    !headers["content-type"]?.includes(expectedContentType)
                ) {
                    result.contentTypeMatch = false;
                } else {
                    result.contentTypeMatch = true;
                }

                resolve(result);
            });
        });

        req.on("error", (error) => {
            resolve({
                url,
                accessible: false,
                error: error.message,
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                url,
                accessible: false,
                error: "Request timeout",
            });
        });
    });
}

// Verify S3 direct URLs
async function verifyS3DirectUrls() {
    log.info("Verifying S3 direct URLs...");

    const baseUrl = `https://s3-${CONFIG.region}.amazonaws.com/${CONFIG.bucketName}`;
    const results = [];

    for (const file of CONFIG.files) {
        const url = `${baseUrl}/${file}`;
        let expectedContentType = null;

        if (file.endsWith(".html")) expectedContentType = "text/html";
        else if (file.endsWith(".js"))
            expectedContentType = "application/javascript";
        else if (file.endsWith(".css")) expectedContentType = "text/css";
        else if (file.endsWith(".svg")) expectedContentType = "image/svg";

        const result = await checkUrl(url, expectedContentType);
        results.push(result);

        if (result.accessible) {
            log.success(
                `✓ ${file} - ${result.statusCode} (${result.size} bytes)`
            );
            if (result.cacheControl) {
                console.log(`  Cache-Control: ${result.cacheControl}`);
            }
        } else {
            log.error(`✗ ${file} - ${result.error || result.statusCode}`);
        }
    }

    return results;
}

// Verify S3 website URLs
async function verifyS3WebsiteUrls() {
    log.info("Verifying S3 website URLs...");

    const websiteUrl = `http://${CONFIG.bucketName}.s3-website-${CONFIG.region}.amazonaws.com`;
    const result = await checkUrl(websiteUrl, "text/html");

    if (result.accessible) {
        log.success(`✓ Website URL accessible - ${result.statusCode}`);
        console.log(`  URL: ${websiteUrl}`);
    } else {
        log.error(
            `✗ Website URL not accessible - ${
                result.error || result.statusCode
            }`
        );
    }

    return result;
}

// Test widget functionality
async function testWidgetFunctionality() {
    log.info("Testing widget JavaScript functionality...");

    const widgetUrl = `https://s3-${CONFIG.region}.amazonaws.com/${CONFIG.bucketName}/chat-widget.js`;
    const result = await checkUrl(widgetUrl, "application/javascript");

    if (result.accessible) {
        log.success(
            `✓ Widget script accessible - ${result.statusCode} (${result.size} bytes)`
        );

        // Basic content checks
        const content = await new Promise((resolve) => {
            const client = https;
            client.get(widgetUrl, (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => resolve(data));
            });
        });

        // Check for key widget components
        const checks = [
            { name: "React components", pattern: /React|createElement/ },
            { name: "Socket.io client", pattern: /socket\.io|io\(/ },
            {
                name: "Widget initialization",
                pattern: /initChatWidget|chatWidgetConfig/,
            },
            { name: "WebSocket functionality", pattern: /WebSocket|ws:|wss:/ },
        ];

        checks.forEach((check) => {
            if (check.pattern.test(content)) {
                log.success(`  ✓ ${check.name} found`);
            } else {
                log.warning(`  ⚠ ${check.name} not detected`);
            }
        });
    } else {
        log.error(
            `✗ Widget script not accessible - ${
                result.error || result.statusCode
            }`
        );
    }

    return result;
}

// Generate integration example
function generateIntegrationExample() {
    console.log("\n" + "=".repeat(50));
    console.log("📋 INTEGRATION EXAMPLE");
    console.log("=".repeat(50));

    const widgetUrl = `https://s3-${CONFIG.region}.amazonaws.com/${CONFIG.bucketName}/chat-widget.js`;

    console.log("\nAdd this code to your website:");
    console.log("\n```html");
    console.log("<!-- Configure the chat widget -->");
    console.log("<script>");
    console.log("  window.chatWidgetConfig = {");
    console.log("    title: 'Customer Support',");
    console.log("    color: '#007bff',");
    console.log("    socketUrl: 'wss://your-api-domain.com',");
    console.log("    startingMessage: 'Hello! How can I help you today?'");
    console.log("  };");
    console.log("</script>");
    console.log("");
    console.log("<!-- Load the chat widget -->");
    console.log(`<script src="${widgetUrl}"></script>`);
    console.log("```\n");
}

// Main verification function
async function main() {
    console.log("=".repeat(50));
    console.log("🔍 BoSar Chat Widget Deployment Verification");
    console.log("=".repeat(50));
    console.log(`\nBucket: ${CONFIG.bucketName}`);
    console.log(`Region: ${CONFIG.region}\n`);

    try {
        // Run all verification tests
        const s3Results = await verifyS3DirectUrls();
        const websiteResult = await verifyS3WebsiteUrls();
        const widgetResult = await testWidgetFunctionality();

        // Summary
        console.log("\n" + "=".repeat(50));
        console.log("📊 VERIFICATION SUMMARY");
        console.log("=".repeat(50));

        const totalFiles = s3Results.length;
        const accessibleFiles = s3Results.filter((r) => r.accessible).length;
        const websiteAccessible = websiteResult.accessible;
        const widgetAccessible = widgetResult.accessible;

        console.log(`\n📁 Files: ${accessibleFiles}/${totalFiles} accessible`);
        console.log(
            `🌐 Website: ${
                websiteAccessible ? "✓ Accessible" : "✗ Not accessible"
            }`
        );
        console.log(
            `🔧 Widget: ${
                widgetAccessible ? "✓ Accessible" : "✗ Not accessible"
            }`
        );

        if (
            accessibleFiles === totalFiles &&
            websiteAccessible &&
            widgetAccessible
        ) {
            log.success(
                "\n🎉 All verification checks passed! Deployment is successful."
            );
            generateIntegrationExample();
        } else {
            log.error(
                "\n❌ Some verification checks failed. Please review the deployment."
            );

            if (accessibleFiles < totalFiles) {
                console.log("\nMissing files:");
                s3Results
                    .filter((r) => !r.accessible)
                    .forEach((r) => {
                        console.log(
                            `  - ${r.url.split("/").pop()}: ${
                                r.error || r.statusCode
                            }`
                        );
                    });
            }
        }
    } catch (error) {
        log.error(`Verification failed: ${error.message}`);
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
    console.log("BoSar Chat Widget Deployment Verification\n");
    console.log("Usage: node verify-deployment.js [options]\n");
    console.log("Options:");
    console.log("  --help, -h     Show this help message\n");
    console.log(
        "This script verifies that the chat widget is properly deployed to S3."
    );
    process.exit(0);
}

// Run verification
main().catch((error) => {
    log.error(`Verification failed: ${error.message}`);
    process.exit(1);
});
