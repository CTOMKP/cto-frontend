export function formatRelativeAge(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

/**
 * Convert age from "309 days" format to relative format like "309d" or "13hr"
 * Handles both "X days" and "X days" formats
 */
export function convertAgeToRelative(ageStr: string | null | undefined): string | null {
  if (!ageStr || typeof ageStr !== 'string') return null;
  
  // Parse "309 days" or "1 day" format
  const match = ageStr.match(/(\d+(?:\.\d+)?)\s*(?:day|days|d)/i);
  if (match) {
    const days = parseFloat(match[1]);
    const hours = Math.floor(days * 24);
    
    if (hours < 24) {
      return `${hours}hr`;
    } else if (days < 30) {
      return `${Math.floor(days)}d`;
    } else {
      const months = Math.floor(days / 30);
      return `${months}mo`;
    }
  }
  
  // If already in relative format (e.g., "1hr", "13hr", "309d"), return as-is
  if (/^\d+(min|hr|d|mo)$/i.test(ageStr.trim())) {
    return ageStr.trim();
  }
  
  return null;
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

