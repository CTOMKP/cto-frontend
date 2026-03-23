import React from "react";
import Image from "next/image";
import { Clock, Search } from "lucide-react";
import type { MessageThread } from "@/types/messages";

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "";
  const diff = Date.now() - ts;
  if (diff < 0) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Avatar for the *other* party in the thread (matches cto-test-frontend data). */
function sidebarAvatarUrl(
  t: MessageThread,
  currentUserId: number | null,
): string | null {
  if (currentUserId == null) {
    return (
      t.poster?.avatarUrl ||
      (typeof t.ad?.user?.avatarUrl === "string" ? t.ad.user.avatarUrl : null) ||
      t.applicant?.avatarUrl ||
      null
    );
  }
  if (t.posterId === currentUserId) {
    return t.applicant?.avatarUrl || null;
  }
  return (
    t.poster?.avatarUrl ||
    (typeof t.ad?.user?.avatarUrl === "string" ? t.ad.user.avatarUrl : null) ||
    null
  );
}

export default function MessagesSidebar({
  threads,
  activeThreadId,
  currentUserId,
  loadingThreads,
  polling,
  onSelectThread,
}: {
  threads: MessageThread[];
  activeThreadId: string | null;
  currentUserId: number | null;
  loadingThreads?: boolean;
  polling?: boolean;
  onSelectThread: (threadId: string) => void;
}) {
  return (
    <aside className="w-[360px] h-screen overflow-auto hover-scrollbar bg-[#000000] p-2.5">
      <div className="">
        <div className="relative flex items-center">
          <input
            className="w-full pl-8 bg-[#0D0D0D] rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/30"
            placeholder="Search messages"
          />
          <Search className="h-4 w-4 absolute left-2 text-white/70" />
        </div>
      </div>

      <div className="h-[calc(100vh-160px)] overflow-auto hover-scrollbar mt-4 space-y-2.5">
        {threads.length === 0 && !loadingThreads ? (
          <div className="p-4 text-sm text-white/50">No conversations</div>
        ) : (
          threads.map((t) => {
            const isActive = t.id === activeThreadId;
            const title =
              (typeof t.ad?.title === "string" && t.ad.title) || "Conversation";
            const avatarUrl = sidebarAvatarUrl(t, currentUserId);
            const preview =
              (typeof t.lastMessagePreview === "string" && t.lastMessagePreview) ||
              "";
            const time =
              (typeof t.lastMessageAt === "string" ? t.lastMessageAt : undefined) ??
              (typeof t.updatedAt === "string" ? t.updatedAt : undefined);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectThread(t.id)}
                className={`w-full cursor-pointer text-left px-4 py-3 mb-2 transition-colors ${
                  isActive
                    ? "bg-[#181818]"
                    : "border-transparent hover:bg-[#181818]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-11 rounded-full bg-white/5 overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                        {title.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate w-[100px]">
                        {title ?? t.poster?.name}
                      </div>
                      <div className="flex items-center gap-1 text-[14px] text-[#838383] w-fit">
                      {formatRelativeTime(time) || "—"}
                    </div>
                      {/* {t.unreadCount ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFCB45] text-black">
                          {t.unreadCount}
                        </span>
                      ) : null} */}
                    </div>
                    <div className="mt-2.5 text-sm text-[#A2A2A2] truncate">
                      {preview || "No messages yet"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
        {loadingThreads ? (
          <div className="p-2 text-[11px] text-white/40 text-center">Loading…</div>
        ) : null}
        {polling ? (
          <div className="p-2 text-[11px] text-white/40 text-center hidden">Refreshing…</div>
        ) : null}
      </div>
    </aside>
  );
}
