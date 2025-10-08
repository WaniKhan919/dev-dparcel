import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";

interface DropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  closeOthers: () => void;
}

export default function MessageDropdown({ isOpen, onToggle, closeOthers }: DropdownProps) {
    const [hasNewMessages, setHasNewMessages] = useState(true);

    const handleClick = () => {
        closeOthers();
        onToggle();
        setHasNewMessages(false);
    };

    // Example message data (you can replace with API response)
    const messages = [
        {
            id: 1,
            name: "Sarah Johnson",
            avatar: "/images/user/user-02.jpg",
            message: "Hey, can we reschedule our meeting?",
            time: "2 min ago",
            status: "online",
        },
        {
            id: 2,
            name: "John Smith",
            avatar: "/images/user/user-03.jpg",
            message: "Please review the attached document.",
            time: "10 min ago",
            status: "online",
        },
        {
            id: 3,
            name: "Emily Davis",
            avatar: "/images/user/user-04.jpg",
            message: "Got your message, will get back soon!",
            time: "30 min ago",
            status: "offline",
        },
    ];

    return (
        <div className="relative">
            {/* Message Icon Button */}
            <button
                className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                onClick={handleClick}
            >
                {hasNewMessages && (
                    <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-blue-500">
                        <span className="absolute inline-flex w-full h-full bg-blue-500 rounded-full opacity-75 animate-ping"></span>
                    </span>
                )}

                {/* Message (chat bubble) icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="currentColor"
                        d="M20 2H4C2.9 2 2 2.9 2 4V18L6 14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2ZM20 12H5.17L4 13.17V4H20V12Z"
                    />
                </svg>
            </button>

            {/* Dropdown Panel */}
            <Dropdown
                isOpen={isOpen}
                onClose={handleClick}
                className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700 px-3">
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Messages
                    </h5>
                    <button
                        onClick={handleClick}
                        className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.22 7.28a.75.75 0 011.06 0L12 11.94l4.72-4.66a.75.75 0 111.06 1.06L13.06 13l4.72 4.72a.75.75 0 11-1.06 1.06L12 14.06l-4.72 4.72a.75.75 0 11-1.06-1.06L10.94 13 6.22 8.34a.75.75 0 010-1.06z"
                            />
                        </svg>
                    </button>
                </div>

                {/* Scrollable messages */}
                <ul className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
                    {messages.length > 0 ? (
                        messages.map((msg) => (
                            <li key={msg.id}>
                                <DropdownItem
                                    onItemClick={handleClick}
                                    to={`/messages/${msg.id}`}
                                    className="flex gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                                >
                                    <span className="relative block w-10 h-10 rounded-full">
                                        <img
                                            src={msg.avatar}
                                            alt={msg.name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                        <span
                                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white ${msg.status === "online"
                                                    ? "bg-green-500"
                                                    : "bg-gray-400"
                                                } dark:border-gray-900`}
                                        />
                                    </span>

                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800 dark:text-white/90">
                                            {msg.name}
                                        </span>
                                        <span className="text-sm text-gray-500 truncate dark:text-gray-400 max-w-[200px]">
                                            {msg.message}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
                                    </div>
                                </DropdownItem>
                            </li>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No messages</p>
                    )}
                </ul>

                {/* Fixed footer */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-3">
                    <Link
                        to="/messages"
                        className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        View All Messages
                    </Link>
                </div>
            </Dropdown>

        </div>
    );
}
