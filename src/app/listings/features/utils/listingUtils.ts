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

