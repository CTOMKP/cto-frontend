/**
 * Client session boundary: auth token + user snapshot keys in localStorage.
 * Read/write session fields through this module where possible.
 */

export const AUTH_TOKEN_KEY = "cto_auth_token";
export const USER_ID_KEY = "cto_user_id";
export const USER_EMAIL_KEY = "cto_user_email";
export const USER_NAME_KEY = "cto_user_name";
export const USER_USERNAME_KEY = "cto_user_username";
export const USER_CREATED_KEY = "cto_user_created";
export const WALLET_ID_KEY = "cto_wallet_id";
export const WALLET_ADDRESS_KEY = "cto_wallet_address";
export const USER_AVATAR_URL_KEY = "cto_user_avatar_url";
export const PROFILE_AVATAR_URL_KEY = "profile_avatar_url";
export const PROFILE_AVATAR_META_KEY = "profile_avatar_meta";
export const PROFILE_BANNER_URL_KEY = "profile_banner_url";
export const GENERIC_WALLETS_KEY = "cto_user_wallets";
export const LEGACY_CTO_TOKEN_KEY = "cto_token";
export const LEGACY_CTO_USER_KEY = "cto_user";

const USER_WALLETS_PREFIX = "cto_user_wallets_";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getAuthToken(): string | null {
  return storage()?.getItem(AUTH_TOKEN_KEY) ?? null;
}

export function setAuthToken(token: string): void {
  storage()?.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  storage()?.removeItem(AUTH_TOKEN_KEY);
}

export function getUserId(): string | null {
  return storage()?.getItem(USER_ID_KEY) ?? null;
}

export function getUserEmail(): string | null {
  return storage()?.getItem(USER_EMAIL_KEY) ?? null;
}

/**
 * Clears JWT, user snapshot, avatars, wallet caches, and legacy keys.
 * Does not clear reward/Xp keys — call `clearRewardData()` from `@/utils/rewardStorage` when logging out fully.
 */
export function clearSessionStorage(): void {
  const ls = storage();
  if (!ls) return;

  ls.removeItem(AUTH_TOKEN_KEY);
  ls.removeItem(USER_EMAIL_KEY);
  ls.removeItem(USER_ID_KEY);
  ls.removeItem(USER_NAME_KEY);
  ls.removeItem(USER_USERNAME_KEY);
  ls.removeItem(USER_CREATED_KEY);
  ls.removeItem(WALLET_ID_KEY);
  ls.removeItem(WALLET_ADDRESS_KEY);

  ls.removeItem(USER_AVATAR_URL_KEY);
  ls.removeItem(PROFILE_AVATAR_URL_KEY);
  ls.removeItem(PROFILE_AVATAR_META_KEY);
  ls.removeItem(PROFILE_BANNER_URL_KEY);

  ls.removeItem(GENERIC_WALLETS_KEY);
  ls.removeItem(LEGACY_CTO_TOKEN_KEY);
  ls.removeItem(LEGACY_CTO_USER_KEY);

  for (const key of Object.keys(ls)) {
    if (key.startsWith(USER_WALLETS_PREFIX)) {
      ls.removeItem(key);
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cto-session-cleared"));
  }
}
