"use client";

import { create } from "zustand";
import {
  getAuthToken,
  getStoredAvatarUrl,
  getUserId,
  AUTH_TOKEN_KEY,
  USER_AVATAR_URL_KEY,
  PROFILE_AVATAR_URL_KEY,
} from "@/lib/authSession";

type SessionState = {
  token: string | null;
  userId: string | null;
  hasAvatar: boolean;
  isAuthenticated: boolean;
  hydrateFromStorage: () => void;
  setToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  setHasAvatar: (hasAvatar: boolean) => void;
  clear: () => void;
};

function readSessionSnapshot() {
  const token = getAuthToken();
  const userId = getUserId();
  const hasAvatar = !!getStoredAvatarUrl();
  return {
    token,
    userId,
    hasAvatar,
    isAuthenticated: !!token,
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  ...readSessionSnapshot(),
  hydrateFromStorage: () => set(readSessionSnapshot()),
  setToken: (token) => set((s) => ({ token, isAuthenticated: !!token, userId: s.userId })),
  setUserId: (userId) => set((s) => ({ userId, token: s.token, isAuthenticated: !!s.token })),
  setHasAvatar: (hasAvatar) => set((s) => ({ ...s, hasAvatar })),
  clear: () => set({ token: null, userId: null, hasAvatar: false, isAuthenticated: false }),
}));

let listenersBound = false;
export function bindSessionStoreListeners() {
  if (typeof window === "undefined" || listenersBound) return;
  listenersBound = true;

  const syncAll = () => useSessionStore.getState().hydrateFromStorage();
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === AUTH_TOKEN_KEY ||
      e.key === USER_AVATAR_URL_KEY ||
      e.key === PROFILE_AVATAR_URL_KEY
    ) {
      syncAll();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("avatarUpdated", syncAll as EventListener);
  window.addEventListener("cto-session-cleared", syncAll as EventListener);
}

