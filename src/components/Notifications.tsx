"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Check } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import Image from "next/image";
import { io, type Socket } from "socket.io-client";
import { isApiError } from "@/lib/apiError";
import { notificationKeys } from "@/lib/queryKeys";
import notificationsService from "@/services/notificationsService";
import { useSessionStore } from "@/lib/sessionStore";

export type Filter = "all" | "unread";

export type NotificationItem = {
  id: string;
  title?: string;
  body?: string;
  readAt?: string | null;
  type?: string;
  data?: unknown;
};

type NotificationsListData = { items: NotificationItem[] };

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Notifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const token = useSessionStore((s) => s.token);
  const activeConvoId = useSessionStore((s) => s.activeConversationId);

  const filters: Filter[] = ["all", "unread"];

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async ({ signal }) => {
      const res = await notificationsService.list(false, signal);
      return { items: res.items as NotificationItem[] };
    },
    enabled: !!token,
    staleTime: 30_000,
    refetchInterval: token ? 30_000 : false,
  });

  const items = useMemo(() => (!token ? [] : data?.items ?? []), [token, data?.items]);

  const unreadCount = useMemo(() => items.filter((n) => !n.readAt).length, [items]);

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
    const d = parseData(n.data);

    if (typeof d?.redirectPath === "string" && d.redirectPath.startsWith("/")) {
      return d.redirectPath;
    }

    if (
      n.type === "LISTING_APPROVAL" &&
      (typeof d?.listingId === "string" || typeof d?.listingId === "number")
    ) {
      const listingId = String(d.listingId);
      const isRejected =
        d?.status === "REJECTED" ||
        d?.action === "VIEW_REJECTED_LISTING" ||
        typeof d?.reason === "string" ||
        /rejected/i.test(String(n.title || ""));

      if (isRejected) {
        return `/user-listings/${listingId}`;
      }
      return `/user-listings/${listingId}/live`;
    }

    if (
      n.type === "AD_APPROVAL" &&
      (typeof d?.adId === "string" || typeof d?.adId === "number")
    ) {
      return `/marketplace/${String(d.adId)}`;
    }

    return null;
  };

  const notificationSubtitle = (n: NotificationItem): string | null => {
    if (n.body) return n.body;
    const d = parseData(n.data);

    if (n.type === "LISTING_APPROVAL") {
      const isRejected =
        d?.status === "REJECTED" ||
        d?.action === "VIEW_REJECTED_LISTING" ||
        typeof d?.reason === "string" ||
        /rejected/i.test(String(n.title || ""));
      return isRejected
        ? "Click to view rejection feedback."
        : "Click to view your approved listing.";
    }

    return null;
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<NotificationsListData>(notificationKeys.list());
      const now = new Date().toISOString();
      queryClient.setQueryData<NotificationsListData>(notificationKeys.list(), (old) => {
        const list = old?.items ?? [];
        return {
          items: list.map((item) => (item.id === id ? { ...item, readAt: now } : item)),
        };
      });
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
      const message = isApiError(err) ? err.message : "Could not mark notification read.";
      toast.error(message);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const snapshot = queryClient.getQueryData<NotificationsListData>(notificationKeys.list());
      const unread = (snapshot?.items ?? []).filter((n) => !n.readAt);
      const results = await Promise.allSettled(
        unread.map((n) => notificationsService.markRead(n.id)),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        throw new Error(`${failed} notification(s) could not be marked as read.`);
      }
    },
    onError: (err) => {
      const message = isApiError(err) ? err.message : "Could not mark all as read.";
      toast.error(message);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });

  useEffect(() => {
    if (token) return;
    queryClient.removeQueries({ queryKey: notificationKeys.list() });
  }, [token, queryClient]);

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
      // fallback to polling via refetchInterval
    });
    socket.on("notifications.new", (payload: unknown) => {
      const p = payload as {
        id?: string;
        title?: string;
        body?: string;
        type?: string;
        data?: { conversationId?: string };
      };
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
      queryClient.setQueryData<NotificationsListData>(notificationKeys.list(), (old) => {
        const prev = old?.items ?? [];
        return { items: [newItem, ...prev] };
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [token, activeConvoId, queryClient]);

  useEffect(() => {
    const handler = () => {
      if (token) void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    };
    window.addEventListener("cto-notifications-ping", handler as EventListener);
    return () => window.removeEventListener("cto-notifications-ping", handler as EventListener);
  }, [token, queryClient]);

  const handleClickNotification = async (n: NotificationItem) => {
    try {
      if (!n.readAt) {
        await markReadMutation.mutateAsync(n.id);
      }
      const route = getNotificationRoute(n);
      if (route) {
        setDropdownOpen(false);
        router.push(route);
        return;
      }

      const message = [n.title, n.body].filter(Boolean).join("\n\n");
      if (message) alert(message);
    } catch {
      // mutation onError already toasted
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    markAllReadMutation.mutate();
  };

  const displayedItems =
    selectedFilter === "unread" ? items.filter((n) => !n.readAt) : items;

  const labels: Record<Filter, string> = {
    all: "All",
    unread: `Unread (${unreadCount})`,
  };

  const listErrorMessage =
    isError && error instanceof Error ? error.message : "Failed to load notifications.";

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={() => {
            if (!isDropdownOpen) void refetch();
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
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="border-[0.2px] gap-1 w-[119px] text-[#A1A1AA] disabled:opacity-50 !px-0 border-[#FFFFFF20] rounded-lg h-9 font-medium text-sm flex items-center justify-center hover:bg-white/5"
            >
              Mark as read <Check size={12} />
            </button>
          </div>
        </div>

        <div>
          {token && isPending && items.length === 0 ? (
            <span className="text-xs font-normal text-[#FFFFFFB2]">Loading alerts…</span>
          ) : null}
          {token && isError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 flex flex-col gap-2">
              <span>{listErrorMessage}</span>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-left underline text-red-100 hover:text-white"
              >
                Retry
              </button>
            </div>
          ) : null}
          {!isError && displayedItems.length === 0 && !(token && isPending && items.length === 0) ? (
            <span className="text-xs font-normal text-[#FFFFFFB2]">
              You have no price alerts yet
            </span>
          ) : null}
          {!isError && displayedItems.length > 0 ? (
            <div className="space-y-1">
              {displayedItems.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => void handleClickNotification(n)}
                  disabled={markReadMutation.isPending}
                  className={`w-full text-left rounded-lg px-3 py-2 border-[0.2px] border-transparent hover:border-[#FFFFFF20] hover:bg-white/5 transition-colors disabled:opacity-60 ${
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
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
