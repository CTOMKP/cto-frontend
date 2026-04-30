"use client";

import { create } from "zustand";
import {
  getAuthToken,
  getStoredAvatarUrl,
  getUserEmail,
  getUserId,
  AUTH_TOKEN_KEY,
  USER_AVATAR_URL_KEY,
  USER_EMAIL_KEY,
  USER_NAME_KEY,
  USER_USERNAME_KEY,
  PROFILE_AVATAR_URL_KEY,
} from "@/lib/authSession";

type SessionState = {
  token: string | null;
  userId: string | null;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  hasAvatar: boolean;
  activeConversationId: string | null;
  isAuthenticated: boolean;
  hydrateFromStorage: () => void;
  setToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  setEmail: (email: string | null) => void;
  setUsername: (username: string | null) => void;
  setAvatarUrl: (avatarUrl: string | null) => void;
  setHasAvatar: (hasAvatar: boolean) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  clear: () => void;
};

const ACTIVE_CONVERSATION_KEY = "cto_active_conversation_id";

function readSessionSnapshot() {
  const token = getAuthToken();
  const userId = getUserId();
  const email = getUserEmail();
  const username =
    typeof window === "undefined" ? null : window.localStorage.getItem(USER_USERNAME_KEY);
  const avatarUrl = getStoredAvatarUrl();
  const hasAvatar = !!avatarUrl;
  const activeConversationId =
    typeof window === "undefined" ? null : window.localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  return {
    token,
    userId,
    email,
    username,
    avatarUrl,
    hasAvatar,
    activeConversationId,
    isAuthenticated: !!token,
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  ...readSessionSnapshot(),
  hydrateFromStorage: () => set(readSessionSnapshot()),
  setToken: (token) => set((s) => ({ ...s, token, isAuthenticated: !!token })),
  setUserId: (userId) => set((s) => ({ ...s, userId })),
  setEmail: (email) => set((s) => ({ ...s, email })),
  setUsername: (username) => set((s) => ({ ...s, username })),
  setAvatarUrl: (avatarUrl) => set((s) => ({ ...s, avatarUrl, hasAvatar: !!avatarUrl })),
  setHasAvatar: (hasAvatar) => set((s) => ({ ...s, hasAvatar })),
  setActiveConversationId: (activeConversationId) => {
    if (typeof window !== "undefined") {
      if (activeConversationId) {
        window.localStorage.setItem(ACTIVE_CONVERSATION_KEY, activeConversationId);
      } else {
        window.localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
      }
    }
    set((s) => ({ ...s, activeConversationId }));
  },
  clear: () =>
    set({
      token: null,
      userId: null,
      email: null,
      username: null,
      avatarUrl: null,
      hasAvatar: false,
      activeConversationId: null,
      isAuthenticated: false,
    }),
}));

let listenersBound = false;
export function bindSessionStoreListeners() {
  if (typeof window === "undefined" || listenersBound) return;
  listenersBound = true;

  const syncAll = () => useSessionStore.getState().hydrateFromStorage();
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === AUTH_TOKEN_KEY ||
      e.key === USER_EMAIL_KEY ||
      e.key === USER_NAME_KEY ||
      e.key === USER_USERNAME_KEY ||
      e.key === USER_AVATAR_URL_KEY ||
      e.key === PROFILE_AVATAR_URL_KEY ||
      e.key === ACTIVE_CONVERSATION_KEY
    ) {
      syncAll();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("avatarUpdated", syncAll as EventListener);
  window.addEventListener("cto-session-cleared", syncAll as EventListener);
}

