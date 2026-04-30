"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { SendHorizontal, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage, MessageThread } from "@/types/messages";

const EMOJI_LIST = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😘",
  "😎",
  "🤔",
  "😅",
  "🙂",
  "😇",
  "😉",
  "😌",
  "😜",
  "👍",
  "👎",
  "🙌",
  "🔥",
  "❤️",
];

function renderMessageBody(body: string) {
  const text = String(body || "");
  const segments = text.split(/(https?:\/\/[^\s]+)/g);
  return segments.map((segment, idx) => {
    if (/^https?:\/\/[^\s]+$/i.test(segment)) {
      return (
        <a
          key={`${segment}-${idx}`}
          href={segment}
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-600 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {segment}
        </a>
      );
    }
    return <span key={`${idx}-${segment}`}>{segment}</span>;
  });
}

function groupReactions(reactions: { emoji: string }[] = []) {
  const map = new Map<string, { emoji: string; count: number }>();
  reactions.forEach((r) => {
    const key = r.emoji;
    const prev = map.get(key);
    map.set(key, { emoji: key, count: prev ? prev.count + 1 : 1 });
  });
  return Array.from(map.values());
}

export default function MessagesChatPanel({
  headerTitle,
  messages,
  currentUserId,
  activeThread,
  draft,
  onDraftChange,
  onSend,
  reactionPickerFor,
  onReactionPickerChange,
  onToggleReaction,
  uploadingAttachment,
  attachmentInputRef,
  onAttachmentChange,
  getMessageAvatarSrc,
  onOpenUserProfile,
  loadingMessages,
}: {
  headerTitle: string;
  messages: ChatMessage[];
  currentUserId: number | null;
  activeThread: MessageThread | null;
  draft: string;
  onDraftChange: (v: string) => void;
  onSend: () => void;
  reactionPickerFor: string | null;
  onReactionPickerChange: (id: string | null) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  uploadingAttachment: boolean;
  attachmentInputRef: React.RefObject<HTMLInputElement | null>;
  onAttachmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getMessageAvatarSrc: (senderId: number) => string;
  onOpenUserProfile: (senderId: number) => void;
  loadingMessages?: boolean;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const [messageAvatarErrors, setMessageAvatarErrors] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    setMessageAvatarErrors({});
  }, [activeThread?.id]);

  const items = useMemo(() => messages ?? [], [messages]);

  const renderBody = (m: ChatMessage) => {
    const body = m.body ?? m.content;
    return typeof body === "string" ? body : "";
  };

  const isMine = (m: ChatMessage) => {
    if (currentUserId == null) return false;
    const sender =
      m.senderId != null
        ? Number(m.senderId)
        : m.userId != null
          ? Number(m.userId)
          : null;
    return sender != null && currentUserId === sender;
  };

  const lastMessage = useMemo(() => items[items.length - 1], [items]);

  /** Listing owner (poster) — shown in chat header */
  const posterAvatarUrl = useMemo(() => {
    if (!activeThread) return "";
    const fallback =
      typeof activeThread.ad?.user?.avatarUrl === "string"
        ? activeThread.ad.user.avatarUrl
        : "";
    return (activeThread.poster?.avatarUrl || fallback || "").trim();
  }, [activeThread]);

  const posterLabel =
    activeThread?.poster?.name ||
    activeThread?.poster?.email ||
    headerTitle;

  const [posterAvatarError, setPosterAvatarError] = useState(false);
  useEffect(() => {
    setPosterAvatarError(false);
  }, [activeThread?.id, posterAvatarUrl]);

  return (
    <main className="flex-1 bg-black">
      <div className="h-full flex flex-col min-h-screen">
        <div className="flex border-b border-white/10  items-center justify-between px-12 pt-10 pb-5 overflow-auto hover-scrollbar">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative size-[30px] rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10 outline-none focus-visible:ring-2 focus-visible:ring-[#FFCB45]/50"
            onClick={() => {
              if (activeThread?.posterId) {
                onOpenUserProfile(activeThread.posterId);
              }
            }}
            title="View poster profile"
            disabled={!activeThread?.posterId}
          >
            {posterAvatarUrl && !posterAvatarError ? (
              <Image
                src={posterAvatarUrl}
                alt={posterLabel}
                fill
                className="object-cover"
                unoptimized
                referrerPolicy="no-referrer"
                onError={() => setPosterAvatarError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-sm font-medium">
                {posterLabel.slice(0, 1).toUpperCase()}
              </div>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-white font-semibold text-base truncate w-[200px]">{headerTitle}</h2>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <span>Subject:</span>
          <span className="truncate w-full bg-[#222222] overflow-auto py-2.5 px-4 rounded-[4px] hover-scrollbar">{headerTitle}</span>
        </div>
        </div>

        <div className="flex-1 overflow-auto hover-scrollbar p-4">
          <div className="space-y-4">
            {loadingMessages ? (
              <div className="text-xs text-white/50">Loading messages…</div>
            ) : null}
            {!loadingMessages && items.length === 0 ? (
              <div className="text-white/50 text-sm">No messages yet.</div>
            ) : null}
            {items.map((m) => {
              const mine = isMine(m);
              const senderNum =
                m.senderId != null
                  ? Number(m.senderId)
                  : m.userId != null
                    ? Number(m.userId)
                    : 0;
              const avatarSrc = getMessageAvatarSrc(senderNum);
              const showImg =
                Boolean(avatarSrc) && !messageAvatarErrors[String(senderNum)];

              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[min(520px,78%)] items-end gap-2 ${
                      mine ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <button
                      type="button"
                      className="shrink-0 rounded-full"
                      onClick={() => onOpenUserProfile(senderNum)}
                      title="View profile"
                    >
                      {showImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarSrc}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover border border-white/10"
                          onError={() =>
                            setMessageAvatarErrors((prev) => ({
                              ...prev,
                              [String(senderNum)]: true,
                            }))
                          }
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="block h-7 w-7 rounded-full bg-white/10" />
                      )}
                    </button>
                    <div className="w-full min-w-0">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          onReactionPickerChange(
                            reactionPickerFor === m.id ? null : m.id,
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onReactionPickerChange(
                              reactionPickerFor === m.id ? null : m.id,
                            );
                          }
                        }}
                        className={`rounded-[6px] px-3 py-2.5 text-sm cursor-pointer break-words ${
                          mine
                            ? "ml-auto bg-[#FFF0F4] text-[#4B4B4B]"
                            : "bg-[#F4FFEF] text-[#4B4B4B]"
                        }`}
                        title="React"
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {renderMessageBody(renderBody(m))}
                        </div>
                      </div>
                      {reactionPickerFor === m.id && (
                        <div className="mt-2 rounded-2xl border border-white/10 bg-[#111] p-2">
                          <div className="grid grid-cols-8 gap-2">
                            {EMOJI_LIST.map((e) => (
                              <button
                                key={`${m.id}-${e}`}
                                type="button"
                                className="h-7 w-7 rounded-lg bg-white/5 text-sm hover:bg-white/10"
                                onClick={() => onToggleReaction(m.id, e)}
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {m.reactions && m.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {groupReactions(m.reactions).map((r) => (
                            <button
                              key={`${m.id}-${r.emoji}`}
                              type="button"
                              onClick={() => onToggleReaction(m.id, r.emoji)}
                              className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs text-white"
                            >
                              {r.emoji} {r.count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <input
              ref={attachmentInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={onAttachmentChange}
              accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              className="size-15 shrink-0 rounded-full border border-[#333333] bg-[#1C1C1C] flex items-center justify-center"
              aria-label="Add attachment"
              title="Attach file"
              disabled={uploadingAttachment || !activeThread}
            >
              <Paperclip className="h-4 w-4 text-white/80" />
            </button>
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder={
                uploadingAttachment ? "Uploading attachment…" : "Type your message"
              }
              className="flex-1 h-full bg-[#141414] rounded-[6px] px-4 py-2 text-sm text-white resize-none outline-none placeholder:text-white/60"
            />

            <Button
              type="button"
              onClick={onSend}
              className="size-15 rounded-full cta-gradient text-white hover:opacity-90 flex items-center justify-center shrink-0"
              aria-label="Send message"
              disabled={
                draft.trim().length === 0 || uploadingAttachment || !activeThread
              }
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
