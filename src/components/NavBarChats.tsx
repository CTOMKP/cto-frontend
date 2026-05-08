"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import { getAuthToken, getUserId } from "@/lib/authSession";
import messagesService from "@/services/messagesService";
import type { MessageThread } from "@/types/messages";

export type Filter = "all" | "unread";

function toRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

/** Same shape handling as MarketplaceMessages.listItemsFromResponse */
function listItemsFromResponse(resUnknown: unknown): unknown[] {
  const resObj = toRecord(resUnknown);
  const itemsUnknown =
    resObj?.items ??
    (resObj?.data ? toRecord(resObj.data)?.items : undefined) ??
    (Array.isArray(resUnknown) ? resUnknown : undefined);
  return Array.isArray(itemsUnknown) ? itemsUnknown : [];
}

function totalUnreadFromThreadsPayload(resUnknown: unknown): number {
  const items = listItemsFromResponse(resUnknown);
  let total = 0;
  for (const raw of items) {
    const t = toRecord(raw);
    if (!t) continue;
    const n =
      typeof t.unreadCount === "number"
        ? t.unreadCount
        : Number(t.unreadCount ?? 0);
    if (Number.isFinite(n)) total += n;
  }
  return total;
}

export default function NavBarChats() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [unread, setUnread] = useState(0);
  const [threads, setThreads] = useState<MessageThread[]>([]);

  const filters: Filter[] = ["all", "unread"];

  const labels: Record<Filter, string> = {
    all: "All",
    unread: unread > 0 ? `Unread (${unread})` : "Unread",
  };

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.ctomarketplace.com";

  const loadThreads = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUnread(0);
      setThreads([]);
      return;
    }
    try {
      const res: unknown = await messagesService.listThreads();
      const items = listItemsFromResponse(res)
        .map((raw) => (toRecord(raw) ?? {}) as MessageThread)
        .map((thread) => ({
          ...thread,
          id: thread.id ? String(thread.id) : "",
          unreadCount:
            typeof thread.unreadCount === "number"
              ? thread.unreadCount
              : Number(thread.unreadCount ?? 0),
        }))
        .filter((thread) => thread.id.length > 0);
      setThreads(items);
      setUnread(totalUnreadFromThreadsPayload(res));
    } catch {
      // best-effort (matches cto-test-frontend MessagesBell)
    }
  }, []);

  useEffect(() => {
    void loadThreads();
    const interval = setInterval(() => void loadThreads(), 20_000);
    return () => clearInterval(interval);
  }, [loadThreads]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket: Socket = io(`${backendUrl}/ws`, {
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      socket.emit("notifications.subscribe", { token });
      socket.emit("messages.subscribe", { token });
    });

    socket.on("messages.new", () => {
      setUnread((prev) => prev + 1);
      void loadThreads();
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl, loadThreads]);

  useEffect(() => {
    if (isDropdownOpen) void loadThreads();
  }, [isDropdownOpen, loadThreads]);

  const currentUserId = Number(getUserId() ?? 0);

  const getThreadTitle = useCallback(
    (thread: MessageThread): string => {
      const adTitle =
        thread.ad && typeof thread.ad === "object"
          ? (thread.ad as { title?: string | null }).title
          : null;
      if (adTitle && adTitle.trim().length > 0) return adTitle;

      const posterName = thread.poster?.name?.trim();
      const applicantName = thread.applicant?.name?.trim();
      if (thread.posterId === currentUserId && applicantName) return applicantName;
      if (thread.applicantId === currentUserId && posterName) return posterName;
      return applicantName || posterName || "Conversation";
    },
    [currentUserId],
  );

  const filteredThreads = threads.filter((thread) =>
    selectedFilter === "unread" ? Number(thread.unreadCount ?? 0) > 0 : true,
  );

  return (
    <DropdownMenu
      open={isDropdownOpen}
      onOpenChange={(open) => setDropdownOpen(open)}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex justify-center items-center rounded-lg size-13 border-[0.2px] border-[#FFFFFF20]"
          aria-label="Messages"
        >
          <span className="bg-[#FFFFFF0D] rounded-sm size-7 flex items-center justify-center">
            <Image
              src="/chat.svg"
              alt="Messages"
              width={15}
              height={15}
            />
          </span>
          {unread > 0 && (
            <Badge className="h-4 absolute top-1 right-1 text-[10px] font-bold text-white cta-gradient min-w-4 rounded-full px-1 font-mono tabular-nums">
              <span>{unread}</span>
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#010101] text-white p-6 w-[534px] border-2 border-[#86868630]">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b-[0.5px] border-[#FFFFFF20]">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold mb-0">Chats</h3>
              <Link
                href="/messages"
                className="text-sm text-[#FF9631] hover:underline"
                onClick={() => setDropdownOpen(false)}
              >
                Open messages
              </Link>
            </div>
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
              className="border-[0.2px] gap-1 w-[119px] text-[#A1A1AA] !px-0 border-[#FFFFFF20] rounded-lg h-9 font-medium text-sm flex items-center justify-center"
            >
              Mark as read <Check size={12} />
            </button>
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {filteredThreads.length === 0 ? (
            <span className="text-xs font-normal text-[#FFFFFFB2]">
              {selectedFilter === "unread"
                ? "No unread messages."
                : "You have no chats yet."}
            </span>
          ) : (
            filteredThreads.map((thread) => {
              const preview = (thread.lastMessagePreview ?? "").trim() || "Open chat";
              const unreadCount = Number(thread.unreadCount ?? 0);
              return (
                <Link
                  key={thread.id}
                  href={`/messages/${encodeURIComponent(thread.id)}`}
                  onClick={() => setDropdownOpen(false)}
                  className="block rounded-lg border border-[#FFFFFF20] bg-[#FFFFFF08] hover:bg-[#FFFFFF14] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{getThreadTitle(thread)}</p>
                    {unreadCount > 0 && (
                      <span className="text-[10px] rounded-full px-1.5 py-0.5 cta-gradient text-white font-bold tabular-nums">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-white/70 line-clamp-2">{preview}</p>
                </Link>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
