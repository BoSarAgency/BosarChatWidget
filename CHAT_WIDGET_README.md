# Chat Widget

A customizable React-based chat widget that can be easily integrated into any website.

## Features

- 🎨 **Customizable**: Configure colors, title, and messages
- 📱 **Responsive**: Works on desktop and mobile devices
- ⚡ **Easy Integration**: Simple script inclusion
- 🎯 **Lightweight**: Optimized bundle size
- 🔧 **Configurable**: Flexible configuration options

## Quick Start

### 1. Include the Widget Files

Add the following files to your website:

- `chat-widget.js` - Main widget bundle (includes all components)
- `widget-[hash].css` - Widget styles

### 2. Configure the Widget

Add the configuration script before loading the widget:

```html
<script>
  window.chatWidgetConfig = {
    title: "Customer Support",
    color: "#007bff",
    messagesEndpoint: "/api/messages",
    startingMessage: "Hello! How can I help you today?",
    botId: "106c3cac-0e27-4cc4-851c-921be1b7eeb9"
  };
</script>
```

### 3. Load the Widget

Include the widget files in your HTML:

```html
<!-- Load the chat widget styles -->
<link rel="stylesheet" href="path/to/widget-[hash].css" />

<!-- Load the chat widget script -->
<script type="module" src="path/to/chat-widget.js"></script>
```

## Configuration Options

| Option             | Type   | Default                              | Description                                                  |
| ------------------ | ------ | ------------------------------------ | ------------------------------------------------------------ |
| `title`            | string | `'Chat Support'`                     | Title displayed in the chat header                           |
| `color`            | string | `'#007bff'`                          | Primary color for the widget (header, button, user messages) |
| `messagesEndpoint` | string | `'/api/messages'`                    | API endpoint for sending messages                            |
| `startingMessage`  | string | `'Hello! How can I help you today?'` | Initial message from the bot                                 |
| `botId`            | string | `undefined`                          | Bot identifier sent with messages to the server             |

## Usage Examples

### Basic Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to My Website</h1>

    <!-- Chat Widget Configuration -->
    <script>
      window.chatWidgetConfig = {
        title: "Support Chat",
        color: "#28a745",
        startingMessage: "Hi! Need help? I'm here to assist you.",
        botId: "106c3cac-0e27-4cc4-851c-921be1b7eeb9"
      };
    </script>

    <!-- Load Chat Widget -->
    <link rel="stylesheet" href="./widget-[hash].css" />
    <script type="module" src="./chat-widget.js"></script>
  </body>
</html>
```

### Custom Styling

```html
<script>
  window.chatWidgetConfig = {
    title: "Custom Support",
    color: "#ff6b6b", // Custom red color
    startingMessage: "Welcome! How can we help you today?",
    botId: "106c3cac-0e27-4cc4-851c-921be1b7eeb9"
  };
</script>
```

## Widget Behavior

1. **Chat Button**: Appears as a circular button in the bottom-right corner
2. **Opening Chat**: Click the button to open the chat window
3. **Sending Messages**: Type and press Enter, or click the send button
4. **Message Display**: User messages appear on the right (colored), bot messages on the left (gray)
5. **Closing Chat**: Click the X button in the header or click the chat button again

## Development

### Building the Widget

```bash
npm install
npm run build
```

### Running Development Server

```bash
npm run dev
```

### Testing

Open `test.html` or `integration-example.html` in your browser to see the widget in action.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
