"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Check } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import { io, type Socket } from "socket.io-client";
import notificationsService from "@/services/notificationsService";

export type Filter = "all" | "unread";

export type NotificationItem = {
  id: string;
  title?: string;
  body?: string;
  readAt?: string | null;
  type?: string;
  data?: unknown;
};

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Notifications() {
  const router = useRouter();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("cto_auth_token") : null,
  );

  const filters: Filter[] = ["all", "unread"];

  const parseData = (data: unknown) => {
    if (!data) return null;
    if (typeof data === "object") return data as Record<string, unknown>;
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  };

  const getNotificationRoute = (n: NotificationItem): string | null => {
    const data = parseData(n.data);

    if (typeof data?.redirectPath === "string" && data.redirectPath.startsWith("/")) {
      return data.redirectPath;
    }

    if (n.type === "LISTING_APPROVAL" && typeof data?.listingId === "string") {
      const isRejected =
        data?.status === "REJECTED" ||
        data?.action === "VIEW_REJECTED_LISTING" ||
        typeof data?.reason === "string" ||
        /rejected/i.test(String(n.title || ""));

      if (isRejected) {
        return `/user-listings/${data.listingId}`;
      }
      return `/user-listings/${data.listingId}/live`;
    }

    if (n.type === "AD_APPROVAL" && typeof data?.adId === "string") {
      return `/marketplace/${data.adId}`;
    }

    return null;
  };

  const notificationSubtitle = (n: NotificationItem): string | null => {
    if (n.body) return n.body;
    const data = parseData(n.data);

    if (n.type === "LISTING_APPROVAL") {
      const isRejected =
        data?.status === "REJECTED" ||
        data?.action === "VIEW_REJECTED_LISTING" ||
        typeof data?.reason === "string" ||
        /rejected/i.test(String(n.title || ""));
      return isRejected
        ? "Click to view rejection feedback."
        : "Click to view your listing status page.";
    }

    return null;
  };

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationsService.list();
      const nextItems = (res?.items ?? []) as NotificationItem[];
      setItems(nextItems);
      setUnreadCount(nextItems.filter((n) => !n.readAt).length);
    } catch {
      // best-effort
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (token) loadNotifications();
  }, [token, loadNotifications]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cto_auth_token") setToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => {
      const next = localStorage.getItem("cto_auth_token");
      if (next !== token) setToken(next);
    }, 1000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const backendUrl = getBackendUrl();
    const socket: Socket = io(`${backendUrl}/ws`, {
      transports: ["polling", "websocket"],
    });
    socket.on("connect", () => {
      socket.emit("notifications.subscribe", { token });
    });
    socket.on("connect_error", () => {
      // fallback to polling; list is already polled
    });
    socket.on("notifications.new", (payload: unknown) => {
      const p = payload as { id?: string; title?: string; body?: string; type?: string; data?: { conversationId?: string } };
      const activeConvoId = localStorage.getItem("cto_active_conversation_id");
      const isMessagesPage = window.location.pathname.startsWith("/messages");
      const isSameConvo =
        p?.type === "MESSAGE" &&
        p?.data?.conversationId &&
        p.data.conversationId === activeConvoId;
      if (isMessagesPage && isSameConvo) return;
      const newItem: NotificationItem = {
        id: p?.id ?? String(Date.now()),
        title: p?.title,
        body: p?.body,
        readAt: null,
        type: p?.type,
        data: p?.data,
      };
      setItems((prev) => [newItem, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    const handler = () => {
      if (token) loadNotifications();
    };
    window.addEventListener("cto-notifications-ping", handler as EventListener);
    return () => window.removeEventListener("cto-notifications-ping", handler as EventListener);
  }, [token, loadNotifications]);

  const handleClickNotification = async (n: NotificationItem) => {
    try {
      if (!n.readAt) await notificationsService.markRead(n.id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      const route = getNotificationRoute(n);
      if (route) {
        setDropdownOpen(false);
        router.push(route);
        return;
      }

      const message = [n.title, n.body].filter(Boolean).join("\n\n");
      if (message) alert(message);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    const unread = items.filter((n) => !n.readAt);
    try {
      await Promise.all(unread.map((n) => notificationsService.markRead(n.id)));
      setItems((prev) =>
        prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch {
      // best-effort
    }
  };

  const displayedItems =
    selectedFilter === "unread" ? items.filter((n) => !n.readAt) : items;

  const labels: Record<Filter, string> = {
    all: "All",
    unread: `Unread (${unreadCount})`,
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={() => {
            if (!isDropdownOpen) loadNotifications();
          }}
          className="relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]"
          aria-label="Notifications"
        >
          <span className="bg-[#FFFFFF0D] rounded-sm size-7 flex items-center justify-center">
            <Image
              src="/notification.svg"
              alt="notifications"
              width={15}
              height={15}
            />
          </span>
          {unreadCount > 0 && (
            <Badge className="h-4 absolute top-1 right-1 text-[10px] font-bold text-white cta-gradient min-w-4 rounded-full px-1 font-mono tabular-nums">
              <span>{unreadCount}</span>
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#010101] text-white p-6 w-[534px] border-2 border-[#86868630]">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
            <h3 className="text-base font-bold mb-2">Alerts</h3>
            <Button onClick={() => setDropdownOpen(false)}>
              <X />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5 h-9 border-[0.2px] border-[#FFFFFF20] rounded-lg items-center px-1">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`text-xs px-2 py-1 w-fit font-bold h-[20px] rounded-lg ${
                    selectedFilter === filter
                      ? "bg-[#17171C] text-white"
                      : "bg-transparent text-[#A1A1AA]"
                  }`}
                >
                  {labels[filter]}
                </Button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="border-[0.2px] gap-1 w-[119px] text-[#A1A1AA] disabled:opacity-50 !px-0 border-[#FFFFFF20] rounded-lg h-9 font-medium text-sm flex items-center justify-center hover:bg-white/5"
            >
              Mark as read <Check size={12} />
            </button>
          </div>
        </div>

        <div>
          {displayedItems.length === 0 ? (
            <span className="text-xs font-normal text-[#FFFFFFB2]">
              You have no price alerts yet
            </span>
          ) : (
            <div className="space-y-1">
              {displayedItems.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClickNotification(n)}
                  className={`w-full text-left rounded-lg px-3 py-2 border-[0.2px] border-transparent hover:border-[#FFFFFF20] hover:bg-white/5 transition-colors ${
                    n.readAt ? "text-[#A1A1AA]" : "text-white"
                  }`}
                >
                  <div className="text-sm font-medium">{n.title ?? "Notification"}</div>
                  {notificationSubtitle(n) && (
                    <div className="text-xs text-[#FFFFFFB2] mt-0.5">{notificationSubtitle(n)}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
