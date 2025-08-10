"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import { useSelectedContact } from "@/stores/useSelectedContact";
import useAuth from "@/hooks/useAuth";
import { ThemeButton } from "../theme/ThemeComponent";

interface ContactType {
  content: string;
  from: string;
  to: string;
  status: string;
  timestamp: string;
  chatPartner: string;
  partnerName?: string;
  partnerWaId?: string;
  partnerPicture?: string;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const setSelectedContactId = useSelectedContact(
    (state) => state.setSelectedContactId
  );
  const loggedInUserWaId = useAuth();

  const fetchContacts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat-list`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setContacts(Array.isArray(res.data.conversations) ? res.data.conversations : []);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setContacts([]);
    }
  };

  const updateStatus = async (wa_id: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/update-status`,
        { wa_id, status: "seen" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchContacts();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    if (loggedInUserWaId) {
      fetchContacts();
    }
  }, [loggedInUserWaId]);

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredContacts = contacts.filter((contact) =>
    (contact.partnerName || contact.chatPartner)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-[500px] h-screen bg-white dark:bg-[#0a0a0a] flex flex-col border-r border-gray-300 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#f0f2f5] dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700">
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          WhatsApp
        </div>
        <div className="flex gap-4 text-gray-600 dark:text-gray-300 cursor-pointer">
          <ThemeButton/>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-300 dark:border-gray-700 bg-[#f6f6f6] dark:bg-[#0a0a0a]">
        <div className="flex items-center bg-white dark:bg-[#0a0a0a] rounded-full px-3 py-1 shadow-sm border border-gray-200 dark:border-gray-600">
          <Search size={18} className="text-gray-500 dark:text-gray-300" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 px-2 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0a0a0a]">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact, idx) => {
            const chatPartnerId = contact.chatPartner;
            const chatPartnerProfile = {
              name: contact.partnerName || contact.chatPartner,
              picture: contact.partnerPicture || "",
              number: contact.partnerWaId || contact.chatPartner,
            };
            const isUnread = contact.status !== "seen";

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedContactId(chatPartnerId);
                  updateStatus(chatPartnerId);
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] cursor-pointer border-gray-200 dark:border-gray-700"
              >
                {chatPartnerProfile.picture ? (
                  <img
                    src={chatPartnerProfile.picture}
                    alt={chatPartnerProfile.name}
                    className="w-[50px] h-[50px] rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold">
                    {chatPartnerProfile.name.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 dark:text-gray-100 font-medium truncate">
                      {chatPartnerProfile.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(contact.timestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm truncate ${
                        isUnread
                          ? "font-semibold text-gray-900 dark:text-gray-100"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {contact.content}
                    </p>
                    {isUnread && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        1
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No contacts found.
          </div>
        )}
      </div>
    </div>
  );
}
