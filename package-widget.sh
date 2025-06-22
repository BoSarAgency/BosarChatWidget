#!/bin/bash

# Create widget distribution package
echo "Creating chat widget distribution package..."

# Create widget-dist directory
mkdir -p widget-dist

# Copy necessary files
cp dist/chat-widget.js widget-dist/
cp dist/assets/widget-*.css widget-dist/

# Copy documentation and examples
cp CHAT_WIDGET_README.md widget-dist/README.md
cp test.html widget-dist/
cp integration-example.html widget-dist/

echo "Widget package created in widget-dist/ directory"
echo ""
echo "Files included:"
ls -la widget-dist/
echo ""
echo "To use the widget, include these files in your project:"
echo "1. chat-widget.js (main widget bundle)"
echo "2. widget-*.css (widget styles)"
echo ""
echo "See README.md for integration instructions."
