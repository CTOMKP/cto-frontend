import { BackendWallet, PrivyWalletAccount } from "@/types/privy";

// Helper function to get wallet chain info
export function getWalletChainInfo(wallet: BackendWallet | PrivyWalletAccount) {
  const chainType = "chainType" in wallet ? wallet.chainType : undefined;
  const blockchain = "blockchain" in wallet ? wallet.blockchain : undefined;
  return { chainType, blockchain };
}

// Helper function to get chain display name
export function getChainDisplayName(
  chainType?: string,
  blockchain?: string
): string {
  const chain = (chainType || blockchain || "").toLowerCase();
  const chainUpper = (chainType || blockchain || "").toUpperCase();

  if (chainUpper === "MOVEMENT") return "Movement";
  if (chain === "ethereum" || chainUpper === "ETHEREUM") return "Ethereum";
  if (chain === "solana" || chainUpper === "SOLANA") return "Solana";
  if (chain === "base" || chainUpper === "BASE") return "Base";
  if (chain === "polygon" || chainUpper === "POLYGON") return "Polygon";
  if (chain === "aptos" || chainUpper === "APTOS") return "Aptos";
  return chain || "Unknown";
}

// Helper function to get chain image path
export function getChainImage(chainType?: string, blockchain?: string): string {
  const chain = (chainType || blockchain || "").toLowerCase();
  const chainUpper = (chainType || blockchain || "").toUpperCase();

  const chainMap: Record<string, string> = {
    solana: "/listings-chains/solana.png",
    ethereum: "/listings-chains/ethereum.png",
    bsc: "/listings-chains/bnb.png",
    sui: "/listings-chains/sui.jpg",
    base: "/listings-chains/base.png",
    aptos: "/listings-chains/aptos.png",
    movement: "/listings-chains/movement.png",
    near: "/listings-chains/near.png",
    osmosis: "/listings-chains/osmosis.jpg",
    polygon: "/listings-chains/ethereum.png", // Polygon uses Ethereum image as fallback
  };

  // Check for exact matches first
  if (chainMap[chain]) {
    return chainMap[chain];
  }

  // Check for uppercase matches
  if (chainUpper === "MOVEMENT") return "/listings-chains/movement.png";
  if (chainUpper === "ETHEREUM") return "/listings-chains/ethereum.png";
  if (chainUpper === "SOLANA") return "/listings-chains/solana.png";
  if (chainUpper === "BASE") return "/listings-chains/base.png";
  if (chainUpper === "POLYGON") return "/listings-chains/ethereum.png";
  if (chainUpper === "APTOS") return "/listings-chains/aptos.png";

  // Default fallback
  return "/listings-chains/solana.png";
}

// Helper function to get token logo (for MOVE, USDC, etc.)
export function getTokenLogo(tokenName: string): string {
  const token = tokenName.toUpperCase();

  if (token === "MOVE") {
    return "/listings-chains/movement.png"; // MOVE uses Movement chain logo
  }

  if (token === "USDC") {
    // USDC logo from local public folder
    return "/listings-chains/usdc.png";
  }

  if (token === "SOL") {
    return "/listings-chains/solana.png";
  }

  // Default fallback to Movement logo
  return "/listings-chains/movement.png";
}

// Map chain types to Privy API chain enum values
export function mapToPrivyChain(
  chainType?: string,
  blockchain?: string
): string | null {
  const chain = (chainType || blockchain || "").toLowerCase();
  const chainUpper = (chainType || blockchain || "").toUpperCase();

  const chainMap: Record<string, string> = {
    ethereum: "ethereum",
    base: "base",
    polygon: "polygon",
    solana: "solana",
    aptos: "solana", // Aptos/Movement wallets use solana for balance check in Privy
    movement: "solana",
  };

  if (chainMap[chain]) {
    return chainMap[chain];
  }

  // Handle uppercase
  const upperMap: Record<string, string> = {
    ETHEREUM: "ethereum",
    BASE: "base",
    POLYGON: "polygon",
    SOLANA: "solana",
    APTOS: "solana",
    MOVEMENT: "solana",
  };

  if (upperMap[chainUpper]) {
    return upperMap[chainUpper];
  }

  return null;
}

// Map chain types to Privy API asset enum values
export function mapToPrivyAsset(
  chainType?: string,
  blockchain?: string
): string | null {
  const chain = (chainType || blockchain || "").toLowerCase();
  const chainUpper = (chainType || blockchain || "").toUpperCase();

  const assetMap: Record<string, string> = {
    ethereum: "eth",
    base: "eth",
    polygon: "pol",
    solana: "sol",
    aptos: "aptos", // Using SOL as fallback for Aptos/Movement
    movement: "aptos",
  };

  if (assetMap[chain]) {
    return assetMap[chain];
  }

  const upperMap: Record<string, string> = {
    ETHEREUM: "eth",
    BASE: "eth",
    POLYGON: "pol",
    SOLANA: "sol",
    APTOS: "aptos",
    MOVEMENT: "aptos",
  };

  if (upperMap[chainUpper]) {
    return upperMap[chainUpper];
  }

  return null;
}

// Fetch balance for a wallet using Privy API
// See: https://docs.privy.io/api-reference/wallets/get-balance#get-balance
export async function fetchWalletBalance(
  wallet: BackendWallet | PrivyWalletAccount
): Promise<number> {
  try {
    // Privy API requires wallet ID - only works for PrivyWalletAccount with valid ID
    if (!("id" in wallet) || !wallet.id) {
      console.warn("Wallet ID not available for Privy balance API");
      return 0;
    }

    const { chainType, blockchain } = getWalletChainInfo(wallet);
    const privyChain = mapToPrivyChain(chainType, blockchain);
    const privyAsset = mapToPrivyAsset(chainType, blockchain);

    if (!privyChain || !privyAsset) {
      console.warn(
        `Unsupported chain for Privy balance API: ${chainType || blockchain}`
      );
      return 0;
    }

    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const privyAppSecret = process.env.NEXT_PUBLIC_PRIVY_APP_SECRET;

    // Note: App secret should ideally be stored on backend for security
    // This is a frontend implementation per user's request
    if (!privyAppId || !privyAppSecret) {
      console.warn("Privy App ID or Secret not configured");
      return 0;
    }

    // Create Basic Auth header: base64(appId:appSecret)
    const authString = Buffer.from(`${privyAppId}:${privyAppSecret}`).toString(
      "base64"
    );

    const url = new URL(`https://api.privy.io/v1/wallets/${wallet.id}/balance`);
    url.searchParams.set("chain", privyChain);
    url.searchParams.set("asset", privyAsset);
    url.searchParams.set("include_currency", "usd");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        "privy-app-id": privyAppId,
      },
    });

    if (!response.ok) {
      console.error(
        `Privy balance API error: ${response.status} ${response.statusText}`
      );
      return 0;
    }

    const data = await response.json();

    if (data.balances && data.balances.length > 0) {
      // Get the first balance and return USD value if available, otherwise use native asset value
      const balance = data.balances[0];
      if (balance.display_values?.usd) {
        return parseFloat(balance.display_values.usd);
      }
      // Fallback to native asset value if USD not available
      if (
        balance.display_values &&
        Object.values(balance.display_values).length > 0
      ) {
        const nativeValue = Object.values(balance.display_values)[0];
        return typeof nativeValue === "string" ? parseFloat(nativeValue) : 0;
      }
    }

    return 0;
  } catch (error) {
    console.error("Error fetching wallet balance from Privy:", error);
    return 0;
  }
}
