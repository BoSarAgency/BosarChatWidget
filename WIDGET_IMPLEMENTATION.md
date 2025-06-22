# Chat Widget WebSocket Implementation

This document describes the implementation of the chat widget with WebSocket connectivity according to the API requirements.

## Overview

The chat widget has been updated to connect to the WebSocket API at `ws://localhost:3001/chat` and implements the required events:

- **widget-connect**: Emitted when widget connects with generated customerId
- **widget-send-message**: Emitted for each user message
- **new-message**: Listened for incoming messages (bot/agent responses)
- **message-sent**: Listened for message delivery confirmation
- **conversation-status-changed**: Listened for conversation status changes (auto/human)
- **error**: Listened for error handling

## Implementation Details

### Frontend Changes

#### 1. ChatWidget Component (`src/components/ChatWidget.jsx`)
- Added socket.io-client integration
- Generates unique customerId on initialization
- Establishes WebSocket connection to `ws://localhost:3001/chat`
- Handles connection states (connecting, connected, disconnected, error)
- Emits `widget-connect` on successful connection
- Emits `widget-send-message` for user messages
- Listens for `new-message`, `message-sent`, and `error` events
- Manages conversation state and message history

#### 2. ChatWindow Component (`src/components/ChatWindow.jsx`)
- Added connection status display
- Disables input when not connected
- Shows connection status to user
- Updated placeholder text based on connection state

#### 3. ChatButton Component (`src/components/ChatButton.jsx`)
- Added connection status indicator
- Visual feedback for connection state (green=connected, yellow=connecting, red=error, gray=disconnected)
- Animated pulse effect for connecting state

#### 4. CSS Updates
- Added styles for connection status indicators
- Added styles for connection status display in chat window
- Responsive design maintained

### Backend Changes

#### 1. ChatGateway (`src/chat/chat.gateway.ts`)
- Modified connection handler to allow unauthenticated widget connections
- Added `widget-connect` event handler
- Added `widget-send-message` event handler
- Automatic conversation creation for widget users
- Integration with existing AI response system
- Proper room management for real-time messaging

#### 2. WebSocket DTOs (`src/chat/dto/websocket-message.dto.ts`)
- Added `WidgetConnectDto` for widget connection events
- Added `WidgetMessageDto` for widget message events
- Validation for widget-specific data

## API Events

### Emitted by Widget

#### widget-connect
```javascript
{
  customerId: "customer_1234567890_abc123def"
}
```

#### widget-send-message
```javascript
{
  customerId: "customer_1234567890_abc123def",
  message: "Hello, I need help with my order",
  conversationId: "optional-existing-conversation-id",
  botId: "106c3cac-0e27-4cc4-851c-921be1b7eeb9"
}
```

### Received by Widget

#### new-message
```javascript
{
  id: "message-uuid",
  conversationId: "conversation-uuid",
  message: "Hello! How can I help you today?",
  role: "bot", // or "agent"
  userId: null, // or agent user ID
  user: null, // or agent user object
  createdAt: "2024-01-01T12:00:00Z"
}
```

#### message-sent
```javascript
{
  conversationId: "conversation-uuid",
  messageId: "message-uuid"
}
```

#### conversation-status-changed
```javascript
{
  conversationId: "conversation-uuid",
  status: "human", // or "auto"
  assignedAgent: { // optional, when agent is assigned
    id: "agent-uuid",
    name: "Agent Name"
  }
}
```

#### error
```javascript
{
  message: "Error description"
}
```

## Configuration

The widget accepts the following configuration options:

```javascript
window.chatWidgetConfig = {
  title: 'Customer Support',
  color: '#007bff',
  socketUrl: 'ws://localhost:3001', // WebSocket server URL
  startingMessage: 'Hello! How can I help you today?',
  botId: '106c3cac-0e27-4cc4-851c-921be1b7eeb9' // Bot identifier sent with messages
};
```

## Testing

1. **Start the API server** on localhost:3001
2. **Open `widget-test.html`** in a browser
3. **Check connection status** - indicator should turn green when connected
4. **Send test messages** and verify AI responses
5. **Monitor browser console** for detailed WebSocket event logs

## Dependencies

- **socket.io-client**: WebSocket client library
- **React**: UI framework
- **Vite**: Build tool

## Build

```bash
npm install
npm run build
```

The built widget will be available in `dist/chat-widget.js`.

## Integration

Include the widget in any webpage:

```html
<script src="path/to/chat-widget.js"></script>
<script>
  window.chatWidgetConfig = {
    title: 'Support Chat',
    color: '#007bff',
    socketUrl: 'ws://your-domain.com',
    startingMessage: 'Hi! How can we help?',
    botId: '106c3cac-0e27-4cc4-851c-921be1b7eeb9'
  };
</script>
```

## Connection Flow

1. Widget loads and generates unique customerId
2. Establishes WebSocket connection to `/chat` namespace
3. On successful connection, emits `widget-connect` with customerId
4. Backend allows unauthenticated widget connections
5. When user sends message, widget emits `widget-send-message`
6. Backend creates/finds conversation and stores message
7. Backend generates AI response and broadcasts `new-message`
8. Widget receives and displays the response
9. Connection status is maintained and displayed to user

## Conversation Status Handling

The widget tracks conversation status to provide appropriate user experience:

### Auto Mode (Default)
- **Status**: `"auto"`
- **Behavior**: Shows loading indicator when waiting for bot responses
- **Input**: Disabled while waiting for bot response
- **Placeholder**: "Waiting for bot response..." when sending message

### Human Mode (Agent Takeover)
- **Status**: `"human"`
- **Trigger**: When an agent message is received or `conversation-status-changed` event
- **Behavior**: No loading indicator (agents don't respond automatically)
- **Input**: Remains enabled even after sending messages
- **Placeholder**: "Chatting with human agent..." or "Message sent" after sending

### Status Detection
1. **Automatic**: When a message with `role: "agent"` is received
2. **Event-based**: When `conversation-status-changed` event is received
3. **Persistent**: Status is maintained throughout the conversation session

## Error Handling

- Connection failures are displayed to user
- Retry logic for connection attempts
- Graceful degradation when server is unavailable
- Error messages displayed in chat interface
- Console logging for debugging

## Security Considerations

- Widget connections are anonymous (no authentication required)
- Customer identification through generated customerId
- Rate limiting should be implemented on the server
- Input validation on both client and server
- CORS properly configured for cross-origin requests
