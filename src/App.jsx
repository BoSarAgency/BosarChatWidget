import ChatWidget from "./components/ChatWidget";
import "./App.css";

function App() {
  // Default configuration for the chat widget
  const defaultConfig = {
    title: "ACQG Enterprises Inc.",
    color: "#75080D",
    messagesEndpoint: "/api/messages",
    startingMessage: "Hello! How can I help you today?",
    // socketUrl: "wss://api.bosar.click/chat",
    socketUrl: "ws://localhost:3001/chat",
    botId: "106c3cac-0e27-4cc4-851c-921be1b7eeb9"
  };

  return (
    <div className="App">
      <h1>BoSar Chat Widget Demo</h1>
      <p>
        This is a demo page with the chat widget in the bottom right corner.
      </p>
      <ChatWidget config={defaultConfig} />
    </div>
  );
}

export default App;
