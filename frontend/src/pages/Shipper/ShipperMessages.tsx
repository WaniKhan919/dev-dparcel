import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Chat, { ChatItem } from "../../components/messages/Chat";
import ChatWindow from "../../components/messages/ChatWindow";

export default function ShipperMessages() {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const chats: ChatItem[] = [
    { id: 1, name: "Ahmad", lastMessage: "Where is my package?", time: "2m ago", unread: 2, online: true },
    { id: 2, name: "Sarah", lastMessage: "Thanks!", time: "1h ago", online: false },
    { id: 3, name: "John", lastMessage: "Confirm the weight?", time: "Yesterday", unread: 1, online: true },
  ];

    const messages: {
        id: number;
        sender: "user" | "admin";
        text: string;
        time: string;
    }[] = [
        { id: 1, sender: "admin", text: "Hello! Your package is on the way.", time: "2m ago" },
        { id: 2, sender: "user", text: "Great, thank you!", time: "1m ago" },
    ];


  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  return (
    <>
      <PageMeta title="Messages" description="International Package and mail Forwarding Services" />
      <div className="grid grid-cols-12 gap-4 md:gap-6 p-4">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-5 lg:col-span-4">
          <Chat chats={chats} activeChat={activeChatId} onChatClick={setActiveChatId} />
        </div>

        {/* Chat Window */}
        <div className="col-span-12 md:col-span-7 lg:col-span-8">
          <ChatWindow activeChat={activeChat} messages={messages} />
        </div>
      </div>
    </>
  );
}
