"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  role: string;
}

interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  type: "text" | "counter_offer";
  content?: string;
  offerPrice?: number;
  offerQuantity?: number;
  offerStatus?: "pending" | "accepted" | "declined";
  sender: Participant;
  createdAt: string;
}

interface Thread {
  id: string;
  contextType: string;
  contextId: string;
  otherParticipant: Participant;
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ChatInterface() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialThreadId = searchParams.get("thread");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const initialThreadSelected = useRef(false);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/chat/threads?limit=50");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads);
        return data.threads;
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  const fetchMessages = useCallback(async (threadId: string) => {
    try {
      const res = await fetch(`/api/v1/chat/threads/${threadId}/messages?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  useEffect(() => {
    fetchThreads().then((fetchedThreads) => {
      if (initialThreadId && !initialThreadSelected.current) {
        initialThreadSelected.current = true;
        const thread = fetchedThreads.find((t: Thread) => t.id === initialThreadId);
        if (thread) {
          setSelectedThread(thread);
        }
      }
    });
  }, [fetchThreads, initialThreadId]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
      // Poll for new messages every 3 seconds
      pollingRef.current = setInterval(() => {
        fetchMessages(selectedThread.id);
      }, 3000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedThread, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedThread || (!newMessage.trim() && !showOfferForm)) return;

    setSending(true);
    try {
      const body: Record<string, unknown> = {
        type: "text",
        content: newMessage.trim(),
      };

      if (showOfferForm && offerPrice && offerQuantity) {
        body.type = "counter_offer";
        body.offerPrice = parseFloat(offerPrice);
        body.offerQuantity = parseFloat(offerQuantity);
        body.content = `Penawaran: Rp ${parseFloat(offerPrice).toLocaleString("id-ID")} x ${offerQuantity}`;
      }

      const res = await fetch(`/api/v1/chat/threads/${selectedThread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setNewMessage("");
        setOfferPrice("");
        setOfferQuantity("");
        setShowOfferForm(false);
        fetchMessages(selectedThread.id);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptOffer = async (messageId: string) => {
    if (!selectedThread) return;
    try {
      const res = await fetch(
        `/api/v1/chat/threads/${selectedThread.id}/messages/${messageId}/accept`,
        { method: "POST" }
      );
      if (res.ok) {
        fetchMessages(selectedThread.id);
      }
    } catch (error) {
      console.error("Failed to accept offer:", error);
    }
  };

  const handleDeclineOffer = async (messageId: string) => {
    if (!selectedThread) return;
    try {
      const res = await fetch(
        `/api/v1/chat/threads/${selectedThread.id}/messages/${messageId}/decline`,
        { method: "POST" }
      );
      if (res.ok) {
        fetchMessages(selectedThread.id);
      }
    } catch (error) {
      console.error("Failed to decline offer:", error);
    }
  };

  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString("id-ID")}`;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm" style={{ color: "var(--feature-sub)" }}>
          Memuat chat...
        </div>
      </div>
    );
  }

  // Thread list view
  if (!selectedThread) {
    return (
      <div className="space-y-2">
        {threads.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--feature-card-bg)" }}
          >
            <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" style={{ color: "var(--feature-sub)" }} />
            <p className="text-sm" style={{ color: "var(--feature-sub)" }}>
              Belum ada percakapan. Mulai chat dari produk, lelang, atau RFQ.
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className="w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--feature-card-bg)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: "var(--feature-heading)" }}>
                      {thread.otherParticipant.businessName || thread.otherParticipant.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--hero-dot)",
                        color: "white",
                      }}
                    >
                      {thread.contextType === "product"
                        ? "Produk"
                        : thread.contextType === "auction"
                        ? "Lelang"
                        : thread.contextType === "rfq"
                        ? "RFQ"
                        : "Order"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs truncate" style={{ color: "var(--feature-sub)" }}>
                    {thread.lastMessage
                      ? thread.lastMessage.type === "counter_offer"
                        ? `💰 Penawaran: ${formatCurrency(thread.lastMessage.offerPrice || 0)}`
                        : thread.lastMessage.content
                      : "Belum ada pesan"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <span className="text-xs whitespace-nowrap" style={{ color: "var(--feature-sub)" }}>
                    {thread.lastMessage ? formatTime(thread.lastMessage.createdAt) : ""}
                  </span>
                  {thread.unreadCount > 0 && (
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--hero-dot)" }}
                    >
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    );
  }

  // Message view
  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b p-4"
        style={{ borderColor: "var(--feature-card-border)" }}
      >
        <button
          onClick={() => {
            setSelectedThread(null);
            setMessages([]);
          }}
          className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" style={{ color: "var(--feature-sub)" }} />
        </button>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--feature-heading)" }}>
            {selectedThread.otherParticipant.businessName || selectedThread.otherParticipant.name}
          </p>
          <p className="text-xs" style={{ color: "var(--feature-sub)" }}>
            {selectedThread.contextType === "product"
              ? "Chat Produk"
              : selectedThread.contextType === "auction"
              ? "Chat Lelang"
              : selectedThread.contextType === "rfq"
              ? "Chat RFQ"
              : "Chat Order"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl p-3 ${
                  isOwn
                    ? "bg-[#00aa5b] text-white"
                    : "border"
                }`}
                style={
                  !isOwn
                    ? {
                        borderColor: "var(--feature-card-border)",
                        backgroundColor: "var(--feature-card-bg)",
                      }
                    : undefined
                }
              >
                {msg.type === "counter_offer" ? (
                  <div>
                    <p className="text-xs font-semibold mb-1 opacity-80">💰 Penawaran</p>
                    <p className="text-sm font-bold">
                      {formatCurrency(msg.offerPrice || 0)} x {msg.offerQuantity}
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                      Total: {formatCurrency((msg.offerPrice || 0) * (msg.offerQuantity || 0))}
                    </p>
                    {msg.offerStatus === "pending" && !isOwn && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAcceptOffer(msg.id)}
                          className="rounded-lg bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                        >
                          Terima
                        </button>
                        <button
                          onClick={() => handleDeclineOffer(msg.id)}
                          className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium hover:bg-red-500/30"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                    {msg.offerStatus === "accepted" && (
                      <p className="text-xs mt-1 font-semibold text-green-300">✓ Diterima</p>
                    )}
                    {msg.offerStatus === "declined" && (
                      <p className="text-xs mt-1 font-semibold text-red-300">✗ Ditolak</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <p className={`text-xs mt-1 ${isOwn ? "opacity-70" : ""}`} style={!isOwn ? { color: "var(--feature-sub)" } : undefined}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4" style={{ borderColor: "var(--feature-card-border)" }}>
        {showOfferForm && (
          <div
            className="mb-3 rounded-lg border p-3"
            style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--feature-card-bg)" }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--feature-heading)" }}>
              Formulir Penawaran
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Harga per satuan"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
              />
              <input
                type="number"
                placeholder="Kuantitas"
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
              />
            </div>
            {offerPrice && offerQuantity && (
              <p className="mt-2 text-xs font-medium" style={{ color: "var(--hero-dot)" }}>
                Total: {formatCurrency(parseFloat(offerPrice) * parseFloat(offerQuantity))}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOfferForm(!showOfferForm)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showOfferForm ? "bg-[#00aa5b] text-white border-[#00aa5b]" : ""
            }`}
            style={!showOfferForm ? { borderColor: "var(--feature-card-border)", color: "var(--feature-sub)" } : undefined}
          >
            💰
          </button>
          <input
            type="text"
            placeholder="Ketik pesan..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 rounded-lg border px-4 py-2 text-sm"
            style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || (!newMessage.trim() && !showOfferForm)}
            className="rounded-lg bg-[#00aa5b] p-2 text-white transition-colors hover:bg-[#00aa5b]/80 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
