"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/notifications?limit=10");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      verification: "📋",
      chat: "💬",
      order: "📦",
      auction: "🔨",
      escrow: "💰",
      tracking: "🚚",
      rfq: "📝",
      review: "⭐",
      dispute: "⚠️",
      system: "🔔",
    };
    return icons[type] || "🔔";
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <Bell className="h-5 w-5" style={{ color: "var(--feature-sub)" }} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: "var(--hero-dot)" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border shadow-lg"
          style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--feature-card-bg)" }}
        >
          <div className="flex items-center justify-between border-b p-3" style={{ borderColor: "var(--feature-card-border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--feature-heading)" }}>
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs" style={{ color: "var(--feature-sub)" }}>
                {unreadCount} belum dibaca
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm" style={{ color: "var(--feature-sub)" }}>
                  Tidak ada notifikasi
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full border-b p-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                    !notification.isRead ? "bg-black/3 dark:bg-white/3" : ""
                  }`}
                  style={{ borderColor: "var(--feature-card-border)" }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: "var(--feature-heading)" }}>
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs truncate" style={{ color: "var(--feature-sub)" }}>
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px]" style={{ color: "var(--feature-sub)" }}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span
                        className="mt-1 h-2 w-2 rounded-full"
                        style={{ backgroundColor: "var(--hero-dot)" }}
                      />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t p-2" style={{ borderColor: "var(--feature-card-border)" }}>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-lg py-1.5 text-center text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--hero-dot)" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
