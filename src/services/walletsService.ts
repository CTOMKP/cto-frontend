import { apiGet } from "@/lib/apiClient";
import { getUserId } from "@/lib/authSession";
import { toRecord, unwrapApiData } from "@/lib/apiResponse";
import { getMovementWallet } from "@/lib/movement-wallet";
import { getWalletsFromStorage, saveWalletsToStorage } from "@/utils/localStorage";
import type { BackendWallet } from "@/types/privy";

function normalizeWalletsPayload(payload: unknown): BackendWallet[] {
  const root = toRecord(unwrapApiData(payload));
  if (Array.isArray(root.wallets)) return root.wallets as BackendWallet[];
  return [];
}

export type ResolvedMovementWallet = {
  address: string;
  publicKey?: string;
  public_key?: string;
  chainType: "aptos";
};

function isMovementBackendWallet(wallet: BackendWallet): boolean {
  const blockchain = String(wallet.blockchain ?? "").toUpperCase();
  const chainType = String(wallet.chainType ?? "").toLowerCase();
  return (
    blockchain === "MOVEMENT" ||
    blockchain === "APTOS" ||
    chainType === "movement" ||
    chainType === "aptos"
  );
}

export function findMovementWalletInBackend(
  wallets: BackendWallet[],
): BackendWallet | null {
  return wallets.find((w) => isMovementBackendWallet(w)) ?? null;
}

export function findWalletIdForAddress(
  wallets: BackendWallet[],
  address: string,
): string | null {
  const match = wallets.find(
    (w) =>
      typeof w.address === "string" &&
      w.address.toLowerCase() === address.toLowerCase() &&
      isMovementBackendWallet(w),
  );
  return typeof match?.id === "string" ? match.id : null;
}

export const walletsService = {
  async listPrivyWallets(opts?: {
    userId?: string | null;
    preferStorage?: boolean;
    signal?: AbortSignal;
  }): Promise<BackendWallet[]> {
    const userId = opts?.userId ?? getUserId();
    const preferStorage = opts?.preferStorage !== false;

    if (preferStorage && userId) {
      try {
        const cached = getWalletsFromStorage(userId);
        if (cached && cached.length > 0) return cached;
      } catch {
        // best effort fallback to backend
      }
    }

    const payload = await apiGet<unknown>("/api/v1/auth/privy/wallets", {
      signal: opts?.signal,
    });
    const wallets = normalizeWalletsPayload(payload);

    if (wallets.length > 0 && userId) {
      try {
        saveWalletsToStorage(wallets, userId);
      } catch {
        // cache write should never block consumers
      }
    }

    return wallets;
  },

  async resolveMovementWalletContext(opts?: {
    privyUser?: unknown;
    userId?: string | null;
    preferStorage?: boolean;
    signal?: AbortSignal;
  }): Promise<{
    movementWallet: ResolvedMovementWallet | null;
    backendWallets: BackendWallet[];
    walletId: string | null;
  }> {
    const backendWallets = await this.listPrivyWallets({
      userId: opts?.userId,
      preferStorage: opts?.preferStorage,
      signal: opts?.signal,
    });

    const privyWallet = getMovementWallet(opts?.privyUser);
    if (
      privyWallet &&
      typeof privyWallet.address === "string" &&
      privyWallet.address.length > 0
    ) {
      return {
        movementWallet: {
          address: privyWallet.address,
          publicKey:
            typeof privyWallet.publicKey === "string"
              ? privyWallet.publicKey
              : undefined,
          public_key:
            typeof privyWallet.public_key === "string"
              ? privyWallet.public_key
              : undefined,
          chainType: "aptos",
        },
        backendWallets,
        walletId: findWalletIdForAddress(backendWallets, privyWallet.address),
      };
    }

    const backendMovement = findMovementWalletInBackend(backendWallets);
    if (backendMovement?.address) {
      return {
        movementWallet: {
          address: backendMovement.address,
          publicKey:
            typeof backendMovement.publicKey === "string"
              ? backendMovement.publicKey
              : undefined,
          public_key:
            typeof backendMovement.public_key === "string"
              ? backendMovement.public_key
              : undefined,
          chainType: "aptos",
        },
        backendWallets,
        walletId: typeof backendMovement.id === "string" ? backendMovement.id : null,
      };
    }

    return {
      movementWallet: null,
      backendWallets,
      walletId: null,
    };
  },
};

export default walletsService;
