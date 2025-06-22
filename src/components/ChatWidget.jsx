import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import ChatButton from './ChatButton'
import ChatWindow from './ChatWindow'
import './ChatWidget.css'

const ChatWidget = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('disconnected') // disconnected, connecting, connected, error
  const [customerId, setCustomerId] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [conversationStatus, setConversationStatus] = useState('auto') // auto, human
  const socketRef = useRef(null)

  // Generate unique customer ID
  const generateCustomerId = () => {
    return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const newCustomerId = generateCustomerId()
    setCustomerId(newCustomerId)

    // Connect to WebSocket
    const socketUrl = config.socketUrl;
    setConnectionStatus('connecting')

    socketRef.current = io(socketUrl , {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    })

    const socket = socketRef.current

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Widget connected to chat server')
      setConnectionStatus('connected')

      // Emit widget-connect with customerId
      socket.emit('widget-connect', { customerId: newCustomerId })
    })

    socket.on('disconnect', () => {
      console.log('Widget disconnected from chat server')
      setConnectionStatus('disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Widget connection error:', error)
      setConnectionStatus('error')
    })

    // Message event handlers
    socket.on('new-message', (messageData) => {
      if (messageData.role === 'user') {
        return
      }

      console.log('Received new message:', messageData)

      // Remove loading indicator if it exists
      setMessages(prev => prev.filter(msg => !msg.isLoading))
      setIsWaitingForResponse(false)

      // If this is an agent message, update conversation status to "human"
      if (messageData.role === 'agent') {
        setConversationStatus('human')
      }

      const newMessage = {
        id: messageData.id || Date.now(),
        text: messageData.message || messageData.text,
        sender: messageData.role === 'user' ? 'user' : (messageData.role === 'bot' ? 'bot' : 'agent'),
        timestamp: new Date(messageData.createdAt || Date.now()),
        userId: messageData.userId,
        user: messageData.user
      }

      // Only add the message if it's not from the current user (to prevent duplicates)
      // User messages are added immediately when sent
      if (messageData.role !== 'user') {
        setMessages(prev => [...prev, newMessage])
      }
    })

    socket.on('message-sent', (data) => {
      console.log('Message sent confirmation:', data)
      // Update conversation ID if provided
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }
    })

    // Listen for conversation status changes
    socket.on('conversation-status-changed', (data) => {
      console.log('Conversation status changed:', data)
      setConversationStatus(data.status)
    })

    socket.on('error', (error) => {
      console.error('Widget error:', error)
      // Show error message to user
      const errorMessage = {
        id: Date.now(),
        text: error.message || 'An error occurred. Please try again.',
        sender: 'system',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    })

    socket.on('widget-connected', (data) => {
      console.log('Widget connected successfully:', data)
      // Widget connection confirmed
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [config.socketUrl])

  // Initialize with starting message from config
  useEffect(() => {
    if (config.startingMessage && connectionStatus === 'connected') {
      setMessages([{
        id: 1,
        text: config.startingMessage,
        sender: 'bot',
        timestamp: new Date()
      }])
    }
  }, [config.startingMessage, connectionStatus])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const closeChat = () => {
    setIsOpen(false)
  }

  const sendMessage = async (messageText) => {
    if (!socketRef.current || connectionStatus !== 'connected' || isWaitingForResponse) {
      console.error('Cannot send message: not connected to server or waiting for response')
      return
    }

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsWaitingForResponse(true)

    // Add loading indicator for bot response only if conversation is in auto mode
    if (conversationStatus === 'auto') {
      const loadingMessage = {
        id: 'loading-' + Date.now(),
        isLoading: true,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, loadingMessage])
    }

    // Emit message to server
    socketRef.current.emit('widget-send-message', {
      customerId: customerId,
      conversationId: conversationId,
      message: messageText,
      botId: config.botId,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="chat-widget">
      {isOpen && (
        <ChatWindow
          config={config}
          messages={messages}
          onClose={closeChat}
          onSendMessage={sendMessage}
          connectionStatus={connectionStatus}
          customerId={customerId}
          isWaitingForResponse={isWaitingForResponse}
          conversationStatus={conversationStatus}
        />
      )}
      <ChatButton
        config={config}
        onClick={toggleChat}
        isOpen={isOpen}
        connectionStatus={connectionStatus}
      />
    </div>
  )
}

export default ChatWidget
