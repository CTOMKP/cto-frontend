import type { ApiCoinItem } from "@/types/api";
import type { MockLikeCoin } from "../types/listing";

export function formatRelativeAge(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

/**
 * Convert age from "309 days" format to relative format like "309d" or "13hr" or "45min"
 * Always shows days (not months), and shows seconds/minutes/hours for tokens < 1 day
 */
export function convertAgeToRelative(ageStr: string | null | undefined): string | null {
  if (!ageStr || typeof ageStr !== 'string') return null;
  
  // Parse "309 days" or "1 day" format
  const match = ageStr.match(/(\d+(?:\.\d+)?)\s*(?:day|days|d)/i);
  if (match) {
    const days = parseFloat(match[1]);
    
    // If less than 1 day, convert to hours/minutes/seconds
    if (days < 1) {
      const hours = Math.floor(days * 24);
      if (hours >= 1) {
        return `${hours}hr`;
      }
      const minutes = Math.floor(days * 24 * 60);
      if (minutes >= 1) {
        return `${minutes}min`;
      }
      const seconds = Math.floor(days * 24 * 60 * 60);
      return `${seconds}s`;
    }
    
    // Always show days (not months)
    return `${Math.floor(days)}d`;
  }
  
  // If already in relative format, validate and return
  const relativeMatch = ageStr.trim().match(/^(\d+)(s|sec|min|hr|h|d|day|days)$/i);
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();
    
    // Normalize unit
    if (unit === 'sec' || unit === 's') return `${value}s`;
    if (unit === 'min') return `${value}min`;
    if (unit === 'hr' || unit === 'h') return `${value}hr`;
    if (unit === 'd' || unit === 'day' || unit === 'days') return `${value}d`;
  }
  
  return null;
}

/**
 * Format age in years, months, and days format: "1y 2mo 4d"
 * Only shows non-zero parts (e.g., "2mo 4d" if no years, "4d" if only days)
 */
export function formatAgeYMD(dateOrDays: Date | number | string): string | null {
  let totalDays = 0;

  if (dateOrDays instanceof Date) {
    const diffMs = Date.now() - dateOrDays.getTime();
    totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } else if (typeof dateOrDays === 'number') {
    totalDays = Math.floor(dateOrDays);
  } else if (typeof dateOrDays === 'string') {
    // Parse "309 days" or "1 day" format
    const match = dateOrDays.match(/(\d+(?:\.\d+)?)\s*(?:day|days|d)/i);
    if (match) {
      totalDays = Math.floor(parseFloat(match[1]));
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (totalDays < 0) return null;
  if (totalDays === 0) return '0d';

  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (days > 0) parts.push(`${days}d`);

  // If all are zero (shouldn't happen due to check above), return "0d"
  return parts.length > 0 ? parts.join(' ') : '0d';
}

export function getChainImage(chain: string): string {
  const chainMap: Record<string, string> = {
    'solana': '/listings-chains/solana.png',
    'ethereum': '/listings-chains/ethereum.png',
    'bsc': '/listings-chains/bnb.png',
    'sui': '/listings-chains/sui.jpg',
    'base': '/listings-chains/base.png',
    'aptos': '/listings-chains/aptos.png',
    'near': '/listings-chains/near.png',
    'osmosis': '/listings-chains/osmosis.jpg',
  };
  return chainMap[chain.toLowerCase()] || '/listings-chains/solana.png';
}

/** Map API listing rows to table row model (shared by query + client-side filters). */
export function mapApiCoinItemsToMockLikeCoins(items: ApiCoinItem[]): MockLikeCoin[] {
  return items.map((it) => {
    let ageStr: string | null = null;
    if (it.age && typeof it.age === "string" && it.age.trim() !== "") {
      ageStr = formatAgeYMD(it.age);
    } else {
      const createdAt = it.createdAt ? new Date(it.createdAt) : null;
      ageStr = createdAt ? formatAgeYMD(createdAt) : null;
    }

    const holderCount = it.holders ?? it?.metadata?.market?.holders ?? null;

    let tier: string | null = it.tier || null;
    if (tier) {
      tier = String(tier).trim().toLowerCase();
      if (
        tier === "none" ||
        tier === "null" ||
        tier === "undefined" ||
        tier === "" ||
        tier === "—" ||
        tier === "----" ||
        tier === "------" ||
        tier.startsWith("---") ||
        tier === "n/a" ||
        tier === "na" ||
        /^[-—]+$/.test(tier)
      ) {
        tier = null;
      }
    }

    return {
      name: it.name || it.symbol || "",
      whale: false,
      age: ageStr,
      address: it.contractAddress,
      x: undefined,
      website: undefined,
      image: it.logoUrl || it?.metadata?.market?.logoUrl,
      chain: it.chain || "solana",
      category: it.category || "meme",
      communityScore:
        typeof it.communityScore === "number"
          ? it.communityScore
          : (it?.metadata?.market?.communityScore ?? 0),
      degenAudit:
        typeof it.riskScore === "number" ? it.riskScore : (it?.metadata?.market?.riskScore ?? 0),
      tier,
      mindshare: undefined,
      price: {
        amount: Number(it.priceUsd ?? 0),
        change: {
          "1m": 0,
          "5m": 0,
          "1h": Number(it.change1h ?? 0),
          "5h": 0,
          "24h": Number(it.change24h ?? 0),
        },
      },
      marketCap: Number(it.marketCap ?? it?.metadata?.market?.fdv ?? 0),
      liquidity: Number(it.liquidityUsd ?? 0),
      volume: { amount: Number(it.volume24h ?? it?.metadata?.market?.volume?.h24 ?? 0) },
      holders:
        holderCount !== null && holderCount !== undefined ? Number(holderCount) : null,
    } as MockLikeCoin;
  });
}

