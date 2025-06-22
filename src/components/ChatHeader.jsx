import './ChatHeader.css'

const ChatHeader = ({ title, color, onClose }) => {
  const headerStyle = {
    backgroundColor: color || '#007bff',
    borderColor: color || '#007bff'
  }

  return (
    <div className="chat-header" style={headerStyle}>
      <h3 className="chat-title">{title}</h3>
      <button
        className="chat-close-button"
        onClick={onClose}
        aria-label="Close chat"
      >
        {/* Close icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

export default ChatHeader
