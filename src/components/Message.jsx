import ReactMarkdown from 'react-markdown'
import './Message.css'

const Message = ({ message, config }) => {
  const isUser = message.sender === 'user'
  const isBot = message.sender === 'bot'
  const isLoading = message.isLoading

  const messageStyle = isUser ? {
    backgroundColor: config.color || '#007bff',
    color: 'white' // Ensure white text on colored background
  } : {}

  if (isLoading) {
    return (
      <div className="message message--bot">
        <div className="message-bubble">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--bot'}`}>
      <div className="message-bubble" style={messageStyle}>
        {isBot ? (
          <div className="message-text">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        ) : (
          <p className="message-text">{message.text}</p>
        )}
        <span className="message-time">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default Message
