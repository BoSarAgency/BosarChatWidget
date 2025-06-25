import ChatWidget from "./components/ChatWidget";
import "./App.css";

function App() {
  // Default configuration for the chat widget
  const defaultConfig = {
    title: "Bosar Agency",
    color: "#75080D",
    messagesEndpoint: "/api/messages",
    startingMessage: "Hello! How can I help you today?",
    socketUrl: "wss://api.bosar.click/chat",
    // socketUrl: "ws://localhost:3001/chat",
    botId: "55399af4-a571-4eb3-af02-3c0201876478"
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
