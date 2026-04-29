"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { getAuthToken, getUserId } from "@/lib/authSession";
import { toast } from "react-toastify";
import messagesService from "@/services/messagesService";
import escrowService from "@/services/escrowService";
import MessagesSidebar from "./MessagesSidebar";
import MessagesChatPanel from "./MessagesChatPanel";
import MessagesDetailsPanel from "./MessagesDetailsPanel";
import { EscrowCreateModal, EscrowViewModal } from "./EscrowModals";
import type {
  ChatMessage,
  EscrowSummary,
  MessageReaction,
  MessageThread,
} from "@/types/messages";

function toRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function readString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function readNumberOrString(v: unknown): number | string | undefined {
  return typeof v === "number" || typeof v === "string" ? v : undefined;
}

function coerceThread(o: Record<string, unknown>): MessageThread {
  const id = o.id != null ? String(o.id) : "";
  return {
    ...o,
    id,
    posterId: Number(o.posterId ?? 0),
    applicantId: Number(o.applicantId ?? 0),
  } as MessageThread;
}

function listItemsFromResponse(resUnknown: unknown): unknown[] {
  const resObj = toRecord(resUnknown);
  const itemsUnknown =
    resObj?.items ??
    (resObj?.data ? toRecord(resObj.data)?.items : undefined) ??
    (Array.isArray(resUnknown) ? resUnknown : undefined);
  return Array.isArray(itemsUnknown) ? itemsUnknown : [];
}

function normalizeGetThreadResponse(resUnknown: unknown): {
  conversation: Record<string, unknown> | null;
  messages: unknown[];
} {
  const resObj = toRecord(resUnknown);
  if (!resObj) return { conversation: null, messages: [] };
  const convoRaw = resObj.conversation ?? resObj.thread ?? null;
  const convo = convoRaw ? toRecord(convoRaw) : null;
  const messagesRaw = resObj.messages;
  const messagesArr = Array.isArray(messagesRaw) ? messagesRaw : [];
  return { conversation: convo, messages: messagesArr };
}

function normalizeMessage(
  mUnknown: unknown,
  idx: number,
): ChatMessage {
  const mObj = toRecord(mUnknown) ?? {};
  const id = String(mObj.id ?? mObj._id ?? mObj.messageId ?? idx);
  const body = readString(mObj.body ?? mObj.content);
  const content = readString(mObj.content);
  const createdAt = readString(mObj.createdAt ?? mObj.created_at);
  const senderIdRaw = readNumberOrString(mObj.senderId ?? mObj.userId);
  const senderId =
    typeof senderIdRaw === "number"
      ? senderIdRaw
      : senderIdRaw != null
        ? Number(senderIdRaw)
        : undefined;
  const userIdRaw = readNumberOrString(mObj.userId ?? mObj.senderId);
  const userId =
    typeof userIdRaw === "number"
      ? userIdRaw
      : userIdRaw != null
        ? Number(userIdRaw)
        : undefined;
  const reactions = Array.isArray(mObj.reactions)
    ? (mObj.reactions as MessageReaction[])
    : [];
  return {
    ...mObj,
    id,
    body,
    content,
    createdAt,
    senderId,
    userId,
    reactions,
  };
}

function withAvatarCache(url: string, cacheValue?: string | number): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${cacheValue ?? Date.now()}`;
}

export default function MarketplaceMessages({
  initialThreadId,
  initialProfileUserId,
}: {
  initialThreadId?: string | null;
  initialProfileUserId?: string | null;
}) {
  const router = useRouter();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(
    null,
  );
  const [currentEscrow, setCurrentEscrow] = useState<EscrowSummary | null>(null);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [escrowViewOpen, setEscrowViewOpen] = useState(false);
  const [showEscrowProposed, setShowEscrowProposed] = useState(false);
  const [polling, setPolling] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const threadsRef = useRef<MessageThread[]>([]);
  threadsRef.current = threads;

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.ctomarketplace.com";

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = getUserId();
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, []);

  const selectedProfileUserId = useMemo(() => {
    if (!initialProfileUserId) return null;
    const n = Number(initialProfileUserId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [initialProfileUserId]);

  const loadThreads = useCallback(async () => {
    const resUnknown: unknown = await messagesService.listThreads();
    const itemsArray = listItemsFromResponse(resUnknown);
    const next = itemsArray
      .map((item) => coerceThread(toRecord(item) ?? {}))
      .filter((t) => t.id.length > 0);
    setThreads(next);
    return next;
  }, []);

  const loadActiveThread = useCallback(async (threadId: string) => {
    setLoadingMessages(true);
    setError(null);
    try {
      const threadResUnknown: unknown =
        await messagesService.getThread(threadId);
      const { conversation, messages: msgRaw } =
        normalizeGetThreadResponse(threadResUnknown);
      const fromList =
        threadsRef.current.find((t) => t.id === threadId) ?? null;

      let merged: MessageThread | null = fromList;
      if (conversation?.id) {
        const convThread = coerceThread({
          ...fromList,
          ...conversation,
        } as Record<string, unknown>);
        merged = convThread;
      } else if (fromList) {
        merged = fromList;
      } else if (conversation?.id) {
        merged = coerceThread(conversation);
      }

      setActiveThread(merged);

      setMessages(
        msgRaw.map((mUnknown, idx) => normalizeMessage(mUnknown, idx)),
      );

      try {
        await messagesService.markRead(threadId);
      } catch {
        // ignore
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load thread");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const refreshEscrowForActiveThread = useCallback(async () => {
    if (!activeThreadId) return null;
    try {
      const resUnknown = await escrowService.getLatestByConversation(
        activeThreadId,
      );
      if (resUnknown == null) {
        setCurrentEscrow(null);
        return null;
      }
      const obj = toRecord(resUnknown);
      const escrow = (obj?.escrow ? toRecord(obj.escrow) : obj) as
        | EscrowSummary
        | null;
      setCurrentEscrow(escrow && typeof escrow === "object" ? escrow : null);
      return escrow;
    } catch {
      setCurrentEscrow(null);
      return null;
    }
  }, [activeThreadId]);

  useEffect(() => {
    if (!activeThreadId) return;
    let alive = true;
    setCurrentEscrow(null);
    escrowService
      .getLatestByConversation(activeThreadId)
      .then((resUnknown) => {
        if (!alive) return;
        if (resUnknown == null) {
          setCurrentEscrow(null);
          return;
        }
        const obj = toRecord(resUnknown);
        const escrow = (obj?.escrow ? toRecord(obj.escrow) : obj) as
          | EscrowSummary
          | null;
        setCurrentEscrow(
          escrow && typeof escrow === "object" ? escrow : null,
        );
      })
      .catch(() => {
        if (!alive) return;
        setCurrentEscrow(null);
      });
    return () => {
      alive = false;
    };
  }, [activeThreadId]);

  // Load thread list once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingThreads(true);
        await loadThreads();
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Failed to load messages",
          );
      } finally {
        if (!cancelled) {
          setLoadingThreads(false);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadThreads]);

  // Sync selection from URL, or default to first thread (avoid depending on full `threads` to prevent poll resets)
  const firstThreadId = threads[0]?.id;
  useEffect(() => {
    if (threads.length === 0) {
      if (!initialThreadId) setActiveThreadId(null);
      return;
    }
    if (initialThreadId) {
      setActiveThreadId(initialThreadId);
      return;
    }
    if (firstThreadId) setActiveThreadId(firstThreadId);
  }, [initialThreadId, threads.length, firstThreadId]);

  useEffect(() => {
    if (!activeThreadId) return;
    let cancelled = false;
    (async () => {
      try {
        await loadActiveThread(activeThreadId);
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Failed to load thread",
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeThreadId, loadActiveThread]);

  useEffect(() => {
    const t = setInterval(() => {
      setPolling(true);
      loadThreads()
        .catch(() => void 0)
        .finally(() => setPolling(false));
    }, 15000);
    return () => clearInterval(t);
  }, [loadThreads]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socket: Socket = io(`${backendUrl}/ws`, {
      transports: ["polling", "websocket"],
    });
    let mounted = true;

    const refreshActiveEscrow = () => {
      if (!activeThreadId) return;
      escrowService
        .getLatestByConversation(activeThreadId)
        .then((resUnknown) => {
          if (!mounted) return;
          if (resUnknown == null) {
            setCurrentEscrow(null);
            return;
          }
          const obj = toRecord(resUnknown);
          const escrow = (obj?.escrow ? toRecord(obj.escrow) : obj) as
            | EscrowSummary
            | null;
          setCurrentEscrow(
            escrow && typeof escrow === "object" ? escrow : null,
          );
        })
        .catch(() => {
          if (!mounted) return;
          setCurrentEscrow(null);
        });
    };

    socket.on("connect", () => {
      socket.emit("messages.subscribe", { token });
      socket.emit("notifications.subscribe", { token });
    });

    socket.on("messages.new", (payload: unknown) => {
      const p = toRecord(payload);
      const convoId = p?.conversationId ?? p?.threadId;
      if (
        activeThreadId &&
        convoId != null &&
        String(convoId) !== String(activeThreadId)
      ) {
        return;
      }
      const msgUnknown = p?.message ?? p;
      const msgObj = toRecord(msgUnknown);
      if (!msgObj) return;
      const normalized = normalizeMessage(msgObj, Date.now());
      setMessages((prev) => {
        if (prev.some((m) => m.id === normalized.id)) return prev;
        return [...prev, normalized];
      });
    });

    socket.on("messages.reaction", (payload: unknown) => {
      const p = toRecord(payload);
      if (!p) return;
      if (
        activeThreadId &&
        p.conversationId != null &&
        String(p.conversationId) !== String(activeThreadId)
      ) {
        return;
      }
      const msgId = p.messageId;
      if (msgId == null) return;
      const reactions = Array.isArray(p.reactions)
        ? (p.reactions as MessageReaction[])
        : [];
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id) === String(msgId) ? { ...m, reactions } : m,
        ),
      );
    });

    socket.on("notifications.new", (payload: unknown) => {
      if (!mounted) return;
      const p = toRecord(payload);
      if (p?.type !== "ESCROW") return;
      const data = p.data ? toRecord(p.data) : null;
      const convoId = data?.conversationId;
      if (
        activeThreadId &&
        convoId != null &&
        String(convoId) !== String(activeThreadId)
      ) {
        return;
      }
      refreshActiveEscrow();
    });

    socket.on("escrow.update", (payload: unknown) => {
      const p = toRecord(payload);
      if (!activeThreadId) return;
      const convoId = p?.conversationId;
      if (
        convoId != null &&
        String(convoId) !== String(activeThreadId)
      ) {
        return;
      }
      refreshActiveEscrow();
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [backendUrl, activeThreadId]);

  const isPoster = useMemo(() => {
    if (!activeThread || currentUserId == null) return false;
    return activeThread.posterId === currentUserId;
  }, [activeThread, currentUserId]);

  const headerTitle = useMemo(() => {
    const t = activeThread?.ad?.title;
    return typeof t === "string" && t.length > 0 ? t : "Conversation";
  }, [activeThread?.ad?.title]);

  const posterAvatarSrc = useMemo(() => {
    if (!activeThread) return "";
    const fallback =
      typeof activeThread.ad?.user?.avatarUrl === "string"
        ? activeThread.ad.user.avatarUrl
        : "";
    const base = activeThread.poster?.avatarUrl || fallback;
    if (!base) return "";
    return withAvatarCache(
      base,
      activeThread.poster?.id || activeThread.updatedAt || "",
    );
  }, [activeThread]);

  const applicantAvatarSrc = useMemo(() => {
    if (!activeThread) return "";
    const base = activeThread.applicant?.avatarUrl || "";
    if (!base) return "";
    return withAvatarCache(
      base,
      activeThread.applicant?.id || activeThread.updatedAt || "",
    );
  }, [activeThread]);

  const getMessageAvatarSrc = (senderId: number) => {
    if (!activeThread) return "";
    if (senderId === activeThread.posterId) return posterAvatarSrc;
    if (senderId === activeThread.applicantId) return applicantAvatarSrc;
    return "";
  };

  const onSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const onSend = async () => {
    const body = draft.trim();
    if (!activeThreadId || body.length === 0) return;
    try {
      const resUnknown = await messagesService.sendMessage(
        activeThreadId,
        body,
      );
      const resObj = toRecord(resUnknown);
      const msgRaw = resObj?.message ?? resUnknown;
      const msgObj = toRecord(msgRaw);
      if (msgObj) {
        setMessages((prev) => [
          ...prev,
          normalizeMessage(msgObj, prev.length),
        ]);
      } else {
        await loadActiveThread(activeThreadId);
      }
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    }
  };

  const uploadAttachmentViaPresign = async (file: File) => {
    const token = getAuthToken();
    const uid = currentUserId ?? 0;
    const response = await fetch(`${backendUrl}/api/v1/images/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        type: "generic",
        userId: String(uid || ""),
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to request upload URL");
    }
    const payload: unknown = await response.json();
    const payloadObj = toRecord(payload);
    const dataLayer = payloadObj?.data ? toRecord(payloadObj.data) : null;
    const data = (dataLayer?.data ? toRecord(dataLayer.data) : null) ??
      dataLayer ??
      payloadObj;
    const uploadUrl = data?.uploadUrl;
    const key = data?.key;
    if (typeof uploadUrl !== "string" || typeof key !== "string") {
      throw new Error("Invalid upload response");
    }
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });
    if (!putRes.ok) {
      throw new Error(`Upload failed with status ${putRes.status}`);
    }
    return `${backendUrl}/api/v1/images/view/${key}`;
  };

  const handleAttachmentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!activeThreadId || files.length === 0) return;
    try {
      setUploadingAttachment(true);
      for (const file of files) {
        const viewUrl = await uploadAttachmentViaPresign(file);
        const body = `Attachment: ${file.name}\n${viewUrl}`;
        const resUnknown = await messagesService.sendMessage(
          activeThreadId,
          body,
        );
        const resObj = toRecord(resUnknown);
        const msgRaw = resObj?.message ?? resUnknown;
        const msgObj = toRecord(msgRaw);
        if (msgObj) {
          setMessages((prev) => [
            ...prev,
            normalizeMessage(msgObj, prev.length),
          ]);
        }
      }
      toast.success(
        files.length > 1 ? "Attachments sent" : "Attachment sent",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to upload attachment";
      toast.error(msg);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const onOpenUserProfile = (senderId: number) => {
    if (!activeThreadId) return;
    const sid = Number(senderId);
    if (!Number.isFinite(sid) || sid <= 0) return;
    if (currentUserId != null && sid === currentUserId) {
      router.push("/profile");
      return;
    }
    router.push(`/messages/${activeThreadId}/profile/${sid}`);
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const resUnknown = await messagesService.toggleReaction(
        messageId,
        emoji,
      );
      const resObj = toRecord(resUnknown);
      const reactions = resObj?.reactions;
      if (Array.isArray(reactions)) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, reactions: reactions as MessageReaction[] }
              : m,
          ),
        );
      }
    } catch {
      // ignore
    } finally {
      setReactionPickerFor(null);
    }
  };

  const createEscrow = async (payload: {
    title: string;
    totalAmount: number;
    currency: string;
    deadline: string | null;
    noDeadline: boolean;
    milestones: unknown[];
  }) => {
    if (!activeThreadId) return;
    try {
      const resUnknown = await escrowService.createOffer({
        conversationId: activeThreadId,
        ...payload,
      });
      setEscrowModalOpen(false);
      const obj = toRecord(resUnknown);
      const escrow = (obj?.escrow ? toRecord(obj.escrow) : obj) as
        | EscrowSummary
        | null;
      setCurrentEscrow(
        escrow && typeof escrow === "object" ? escrow : null,
      );
      setShowEscrowProposed(true);
      setTimeout(() => setShowEscrowProposed(false), 3000);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to create escrow offer",
      );
    }
  };

  const openEscrow = () => {
    if (currentEscrow?.id) {
      setEscrowViewOpen(true);
      return;
    }
    setEscrowModalOpen(true);
  };

  const openEscrowView = async () => {
    const escrow = await refreshEscrowForActiveThread();
    if (!escrow?.id) {
      toast.error("No escrow found for this conversation");
      return;
    }
    setEscrowViewOpen(true);
  };

  const onEscrowPrimary = () => {
    if (currentEscrow?.id) {
      void openEscrowView();
    } else {
      openEscrow();
    }
  };

  const applicantDisplayName =
    activeThread?.applicant?.name ||
    activeThread?.applicant?.email ||
    "applicant";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/70">Loading messages...</p>
      </div>
    );
  }

  if (error && !activeThreadId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-white/70 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-[#0D0D0D] px-5 py-2.5">
      {error ? (
        <div className="text-amber-400 text-center text-xs px-1">{error}</div>
      ) : null}
      <div className="flex gap-4 flex-1">
          <MessagesSidebar
            threads={threads}
            activeThreadId={activeThreadId}
            currentUserId={currentUserId}
            loadingThreads={loadingThreads}
            polling={polling}
            onSelectThread={onSelectThread}
          />
        <div className="flex-1 h-screen min-w-0 overflow-auto hover-scrollbar">
          <MessagesChatPanel
            headerTitle={headerTitle}
            messages={messages}
            currentUserId={currentUserId}
            activeThread={activeThread}
            draft={draft}
            onDraftChange={setDraft}
            onSend={onSend}
            reactionPickerFor={reactionPickerFor}
            onReactionPickerChange={setReactionPickerFor}
            onToggleReaction={toggleReaction}
            uploadingAttachment={uploadingAttachment}
            attachmentInputRef={attachmentInputRef}
            onAttachmentChange={handleAttachmentUpload}
            getMessageAvatarSrc={getMessageAvatarSrc}
            onOpenUserProfile={onOpenUserProfile}
            loadingMessages={loadingMessages}
          />
        </div>
        <div className="h-screen overflow-auto hover-scrollbar shrink-0">
          <MessagesDetailsPanel
            thread={activeThread}
            viewerUserId={currentUserId}
            selectedProfileUserId={selectedProfileUserId}
            currentEscrow={currentEscrow}
            isPoster={isPoster}
            onEscrowPrimary={onEscrowPrimary}
            onBackToThread={
              selectedProfileUserId && activeThreadId
                ? () => router.push(`/messages/${activeThreadId}`)
                : undefined
            }
          />
        </div>
      </div>

      {showEscrowProposed && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl border border-white/10 bg-black/90 px-10 py-6 text-center">
            <p className="text-sm text-zinc-400">Escrow deal proposed</p>
            <p className="mt-2 text-xs text-zinc-500">
              Waiting for acceptance by {applicantDisplayName}
            </p>
            <button
              type="button"
              className="mt-4 rounded-full bg-[#FFCB45] px-6 py-2 text-xs font-semibold text-black"
              onClick={() => {
                setShowEscrowProposed(false);
                setEscrowViewOpen(true);
              }}
            >
              View escrow
            </button>
          </div>
        </div>
      )}

      {escrowModalOpen ? (
        <EscrowCreateModal
          onClose={() => setEscrowModalOpen(false)}
          onSubmit={createEscrow}
        />
      ) : null}

      {escrowViewOpen ? (
        <EscrowViewModal
          escrow={currentEscrow}
          onClose={() => setEscrowViewOpen(false)}
          isPoster={isPoster}
          onUpdated={refreshEscrowForActiveThread}
        />
      ) : null}
    </div>
  );
}
