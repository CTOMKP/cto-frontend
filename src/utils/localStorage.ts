/**
 * Utility functions for consistent localStorage access across the application
 */

import { BackendWallet } from "@/types/privy";

/**
 * Get the user-specific localStorage key for wallets
 * @param userId - The user ID (optional, will be fetched from localStorage if not provided)
 * @returns The localStorage key for wallets
 */
export function getWalletsKey(userId?: string | null): string {
  if (!userId) {
    userId = localStorage.getItem('cto_user_id');
  }
  if (!userId) {
    throw new Error('User ID is required for wallet storage');
  }
  return `cto_user_wallets_${userId}`;
}

/**
 * Get wallets from localStorage with proper user-specific key handling
 * @param userId - The user ID (optional, will be fetched from localStorage if not provided)
 * @returns Parsed wallets array or null if not found
 */
export function getWalletsFromStorage(userId?: string | null): BackendWallet[] | null {
  const walletsKey = getWalletsKey(userId);
  const walletsJson = localStorage.getItem(walletsKey);
  
  if (!walletsJson) {
    return null;
  }
  
  try {
    return JSON.parse(walletsJson);
  } catch (error) {
    console.error('Failed to parse wallets from localStorage:', error);
    return null;
  }
}

/**
 * Save wallets to localStorage with proper user-specific key handling
 * @param wallets - The wallets array to save
 * @param userId - The user ID (optional, will be fetched from localStorage if not provided)
 */
export function saveWalletsToStorage(wallets: BackendWallet[], userId?: string | null): void {
  const walletsKey = getWalletsKey(userId);
  localStorage.setItem(walletsKey, JSON.stringify(wallets));
}