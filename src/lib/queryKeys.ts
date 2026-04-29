/**
 * Stable TanStack Query keys — import from here instead of string literals.
 */

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};
