import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import Message from "./Message";
import "./ChatWindow.css";

const ChatWindow = ({ config, messages, onClose, onSendMessage, connectionStatus, customerId, isWaitingForResponse, conversationStatus }) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && connectionStatus === 'connected' && !isInputDisabled) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  const isInputDisabled = connectionStatus !== 'connected' || (isWaitingForResponse && conversationStatus === 'auto');

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-window">
      <ChatHeader title={config.title} color={config.color} onClose={onClose} />

      <div className="chat-messages">
        {messages.map((message) => (
          <Message key={message.id} message={message} config={config} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* <div className="chat-status">
        <small className={`connection-status ${connectionStatus}`}>
          {getConnectionStatusText()}
        </small>
      </div> */}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              connectionStatus !== 'connected' ? "Connecting..." :
              isWaitingForResponse && conversationStatus === 'auto' ? "Waiting for bot response..." :
              isWaitingForResponse && conversationStatus === 'human' ? "Message sent" :
              conversationStatus === 'human' ? "Chatting with human agent..." :
              "Type your message..."
            }
            className="chat-input"
            disabled={isInputDisabled}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={!inputValue.trim() || isInputDisabled}
            style={{
              backgroundColor: config.color || "#007bff",
              borderColor: config.color || "#007bff",
              opacity: isInputDisabled ? 0.5 : 1,
            }}
          >
            {/* Send icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
