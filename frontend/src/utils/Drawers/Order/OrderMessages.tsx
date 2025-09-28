import { useState, useRef, useEffect } from "react";

interface ViewOffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

interface Message {
  id: number;
  type: "text" | "image";
  content: string;
  sender: "user" | "shopper";
}

export default function OrderMessages({
  isOpen,
  onClose,
  orderData,
}: ViewOffersDrawerProps) {
  if (!orderData) return null;
  const initialMessages: Message[] = [
    { id: 1, type: "text", content: "Hello! Is my order on the way?", sender: "user" },
    { id: 2, type: "text", content: "Yes, it was shipped yesterday.", sender: "shopper" },
    { id: 3, type: "image", content: "https://via.placeholder.com/150", sender: "shopper" },
    { id: 4, type: "text", content: "Great! Thanks for the update.", sender: "user" },
    { id: 5, type: "text", content: "You're welcome! 😊", sender: "shopper" },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = (type: "text" | "image", content: string) => {
    if (!content) return;

    const newMessage: Message = {
      id: Date.now(),
      type,
      content,
      sender: "user",
    };
    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      sendMessage("image", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] mt-18">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-3 border-b sticky top-0 z-10">
          <h2 className="text-lg font-semibold">
            Conversation – #{orderData?.order?.tracking_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-8">
              No messages yet. Start the conversation!
            </p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.type === "text" ? (
                  msg.content
                ) : (
                  <img
                    src={msg.content}
                    alt="Sent"
                    className="max-h-60 w-auto rounded"
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage("text", inputMessage)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700"
          >
            📎
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => sendMessage("text", inputMessage)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
