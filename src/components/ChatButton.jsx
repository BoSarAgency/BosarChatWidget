import './ChatButton.css'

const ChatButton = ({ config, onClick, isOpen, connectionStatus }) => {
  const buttonStyle = {
    backgroundColor: config.color || '#007bff',
    borderColor: config.color || '#007bff'
  }

  const getConnectionIndicatorClass = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'connection-indicator--connected'
      case 'connecting':
        return 'connection-indicator--connecting'
      case 'error':
        return 'connection-indicator--error'
      default:
        return 'connection-indicator--disconnected'
    }
  }

  return (
    <div className="chat-button-container">
      <button
        className={`chat-button ${isOpen ? 'chat-button--open' : ''}`}
        onClick={onClick}
        style={buttonStyle}
        aria-label="Open chat"
      >
        {isOpen ? (
          // Close icon (X)
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          // Bot icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9H21ZM19 19H5V9H19V19ZM7 11V13H9V11H7ZM15 11V13H17V11H15ZM7 15H17V17H7V15Z" fill="currentColor"/>
          </svg>
        )}
      </button>
      <div className={`connection-indicator ${getConnectionIndicatorClass()}`}></div>
    </div>
  )
}

export default ChatButton
