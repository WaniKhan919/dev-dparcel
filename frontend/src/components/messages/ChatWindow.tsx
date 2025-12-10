import React from "react";// sidebar chats ke liye type
import { ChatItem } from "./Chat";

interface Message {
  id: number;
  sender: "user" | "admin";
  text: string;
  time: string;
}

interface ChatWindowProps {
  activeChat: ChatItem | null;
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ activeChat, messages }) => {
  if (!activeChat) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-6 md:p-10 min-h-[400px] flex items-center justify-center text-gray-500">
        <p>Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 flex flex-col h-[400px] md:h-[600px]">
      {/* Header */}
      <div className="border-b pb-2 mb-2 flex items-center gap-3">
        <img
          src={activeChat.avatar || `https://ui-avatars.com/api/?name=${activeChat.name}`}
          alt={activeChat.name}
          className="w-10 h-10 rounded-full border"
        />
        <div>
          <p className="font-medium text-gray-800">{activeChat.name}</p>
          {activeChat.online && <p className="text-xs text-green-500">Online</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-2 rounded-lg text-sm ${
                msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
              <div className="text-xs text-gray-500 mt-1 text-right">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-2 flex gap-2 border-t pt-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
