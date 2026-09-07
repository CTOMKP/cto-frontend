import React from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import type {
  InboxFilter,
  MessageThread,
  UserSearchResult,
} from "@/types/messages";

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

function threadTitle(
  t: MessageThread,
  currentUserId: number | null,
): string {
  const counterpart =
    currentUserId != null && t.posterId === currentUserId
      ? t.applicant
      : t.poster;
  if (t.type === "GENERAL") {
    return counterpart?.name || counterpart?.email || "General conversation";
  }
  return (typeof t.ad?.title === "string" && t.ad.title) || "Conversation";
}

export default function MessagesSidebar({
  threads,
  activeThreadId,
  currentUserId,
  loadingThreads,
  polling,
  inboxFilter,
  onInboxFilterChange,
  hasUnreadGeneral,
  hasUnreadMarketplace,
  searchQuery,
  onSearchQueryChange,
  generalUserResults,
  searchingGeneralUsers,
  creatingGeneral,
  onStartGeneralConversation,
  onSelectThread,
}: {
  threads: MessageThread[];
  activeThreadId: string | null;
  currentUserId: number | null;
  loadingThreads?: boolean;
  polling?: boolean;
  inboxFilter: InboxFilter;
  onInboxFilterChange: (filter: InboxFilter) => void;
  hasUnreadGeneral: boolean;
  hasUnreadMarketplace: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  generalUserResults: UserSearchResult[];
  searchingGeneralUsers: boolean;
  creatingGeneral: boolean;
  onStartGeneralConversation: (user: UserSearchResult) => void;
  onSelectThread: (threadId: string) => void;
}) {
  const query = searchQuery.trim().toLowerCase();
  const visibleThreads = query
    ? threads.filter((t) => {
        const title = threadTitle(t, currentUserId).toLowerCase();
        const preview = String(t.lastMessagePreview || "").toLowerCase();
        return title.includes(query) || preview.includes(query);
      })
    : threads;

  return (
    <aside className="w-[360px] h-screen overflow-auto hover-scrollbar bg-[#000000] p-2.5">
      <div className="">
        <div className="relative flex items-center">
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="w-full pl-8 bg-[#0D0D0D] rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/30"
            placeholder={
              inboxFilter === "GENERAL"
                ? "Search messages or people"
                : "Search messages"
            }
            autoComplete="off"
          />
          <Search className="h-4 w-4 absolute left-2 text-white/30" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["GENERAL", "MARKETPLACE"] as const).map((tab) => {
            const active = inboxFilter === tab;
            const hasUnread =
              tab === "GENERAL" ? hasUnreadGeneral : hasUnreadMarketplace;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onInboxFilterChange(tab)}
                className={`flex h-7 items-center justify-center gap-1.5 rounded-[4px] py-2 text-sm font-medium text-white ${
                  active
                    ? "cta-gradient"
                    : "bg-[#181818]"
                }`}
              >
                {tab === "GENERAL" ? "General" : "Marketplace"}
                {hasUnread ? (
                  <span className="size-1.5 rounded-full bg-[#16C784]" />
                ) : null}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onInboxFilterChange("ARCHIVED")}
          className="mt-2 w-full rounded-[4px] bg-gradient-to-r from-[#FF0075]/30 via-[#FF4A15]/30 to-[#FFCB45]/30 p-px"
        >
          <span
            className={`flex h-7 w-full items-center justify-center py-2 rounded-[4px] bg-[#000000] text-sm ${
              inboxFilter === "ARCHIVED" ? "text-white/80" : "text-white/50"
            }`}
          >
            Archive
          </span>
        </button>

        {inboxFilter === "GENERAL" &&
        (searchingGeneralUsers || generalUserResults.length > 0) ? (
          <div className="mt-3 space-y-1 rounded-lg border border-white/10 bg-[#111] p-2">
            {searchingGeneralUsers ? (
              <div className="px-1 py-1 text-[10px] text-white/40">Searching people…</div>
            ) : null}
            {generalUserResults.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                disabled={creatingGeneral}
                onClick={() => onStartGeneralConversation(candidate)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-white/5 disabled:opacity-40"
              >
                {candidate.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-7 w-7 rounded-full bg-white/10" />
                )}
                <span>
                  <span className="block font-medium text-white">
                    {candidate.name || "Unnamed user"}
                  </span>
                  <span className="block text-[10px] text-white/40">
                    Start conversation
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="h-[calc(100vh-160px)] overflow-auto hover-scrollbar mt-4 space-y-2.5">
        {visibleThreads.length === 0 && !loadingThreads ? (
          <div className="p-4 text-center text-sm text-white/50">No conversations</div>
        ) : (
          visibleThreads.map((t) => {
            const isActive = t.id === activeThreadId;
            const counterpart =
              currentUserId != null && t.posterId === currentUserId
                ? t.applicant
                : t.poster;
            const title =
              t.type === "GENERAL"
                ? counterpart?.name || counterpart?.email || "General conversation"
                : (typeof t.ad?.title === "string" && t.ad.title) ||
                  "Conversation";
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
