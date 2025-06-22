import React from 'react'
import { createRoot } from 'react-dom/client'
import ChatWidget from './components/ChatWidget'
import './index.css'

// Global function to initialize the chat widget
window.initChatWidget = function(config = {}) {
  // Default configuration
  const defaultConfig = {
    title: 'Chat Support',
    color: '#007bff',
    messagesEndpoint: '/api/messages',
    startingMessage: 'Hello! How can I help you today?'
  }

  // Merge user config with defaults
  const finalConfig = { ...defaultConfig, ...config }

  // Create container for the widget
  let container = document.getElementById('chat-widget-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'chat-widget-container'
    document.body.appendChild(container)
  }

  // Render the widget
  const root = createRoot(container)
  root.render(<ChatWidget config={finalConfig} />)
}

// Auto-initialize if config is provided via window.chatWidgetConfig
if (window.chatWidgetConfig) {
  window.initChatWidget(window.chatWidgetConfig)
}
