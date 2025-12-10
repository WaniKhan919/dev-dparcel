import React from "react";

export interface ChatItem {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
}

interface ChatProps {
  chats: ChatItem[];
  activeChat: number | null;
  onChatClick: (id: number) => void;
}

const Chat: React.FC<ChatProps> = ({ chats, activeChat, onChatClick }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl border overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatClick(chat.id)}
            className={`flex items-center justify-between px-4 py-3 border-b cursor-pointer transition-all hover:bg-gray-50 
              ${activeChat === chat.id ? "bg-blue-50 border-l-4 border-blue-600" : ""}`}
          >
            {/* Left: Avatar + message */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}`}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full border"
                />
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="overflow-hidden">
                <p className="font-medium text-gray-800">{chat.name}</p>
                <p className="text-xs text-gray-500 line-clamp-2 w-40">
                  {chat.lastMessage}
                </p>
              </div>
            </div>

            {/* Right: Time + unread */}
            <div className="text-right flex flex-col items-end justify-between h-full">
              <p className="text-xs text-gray-500">{chat.time}</p>

              {chat.unread && chat.unread > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full mt-1">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
