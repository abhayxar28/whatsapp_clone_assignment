"use client";

import { useEffect, useState, useRef } from "react";
import { MoreVertical, Smile, Check, CheckCheck, SendHorizontal } from "lucide-react";
import { useSelectedContact } from "@/stores/useSelectedContact";
import axios from "axios";
import EmojiPicker from "emoji-picker-react"; // ✅ added

interface Message {
  content: string;
  from: string;
  receiverProfile: {
    name: string;
    number: string;
    picture?: string;
  };
  status: string;
  timestamp: string;
  to: string;
}

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const selectedContactId = useSelectedContact((state) => state.selectedContactId);
  const [chat, setChat] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // ✅ added
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendChats = async () => {
    if (!chat.trim()) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/send-message`,
        {
          to: selectedContactId,
          message: chat,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setChat("");
      fetchChats();
    } catch (err) {
      console.error("Error sending chat:", err);
    }
  };

  const fetchChats = async () => {
    if (!selectedContactId) {
      setMessages([]);
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/message/${selectedContactId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const sortedMessages = (res.data.messages || []).sort(
        (a: Message, b: Message) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setMessages(sortedMessages);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, [selectedContactId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendChats();
    }
  };

  const onEmojiClick = (emojiData: any) => { // ✅ added
    setChat((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (!selectedContactId) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400 dark:bg-[#0a0a0a]">
        Select a contact to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#efeae2] dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#f0f2f5] dark:bg-[#0a0a0a] border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {messages.length > 0 && messages[0].receiverProfile.picture ? (
            <img
              src={messages[0].receiverProfile.picture}
              alt="Contact"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
              {messages.length > 0
                ? messages[0].receiverProfile.name.slice(0, 1).toUpperCase()
                : "?"}
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {messages.length > 0
                ? messages[0].receiverProfile.name
                : "Loading..."}
            </h3>
          </div>
        </div>
        <div className="flex gap-4 text-gray-600 dark:text-gray-300">
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2] dark:bg-[#0a0a0a]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No chats
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.from === selectedContactId ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs text-sm shadow ${
                  msg.from === selectedContactId
                    ? "bg-white text-black dark:bg-[#1a1a1a] dark:text-gray-100"
                    : "bg-green-500 text-white"
                }`}
              >
                <p>{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span
                    className={`text-[10px] ${
                      msg.from === selectedContactId
                        ? "text-gray-400 dark:text-gray-400"
                        : "text-white"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {msg.from !== selectedContactId && (
                    <>
                      {msg.status === "seen" ? (
                        <CheckCheck size={14} className="text-blue-500" />
                      ) : (
                        <Check size={14} className="text-white" />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 p-3 bg-[#f0f2f5] dark:bg-[#0a0a0a] border-t border-gray-300 dark:border-gray-700 relative">
        <div className="relative">
          <Smile
            size={24}
            className="text-gray-600 dark:text-gray-300 cursor-pointer"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          />
          {showEmojiPicker && (
            <div className="absolute bottom-10 left-0 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Type a message"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 rounded-full outline-none text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            autoFocus
          />
          {chat.trim() && (
            <button
              onClick={sendChats}
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition flex justify-center items-center"
            >
              <SendHorizontal size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
