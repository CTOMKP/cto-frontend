export const formatAddress = (address: string, start: number = 6, end: number = 4): string => {
  if (!address || address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatBalance = (amount: string, decimals: number): string => {
  const num = parseFloat(amount) / Math.pow(10, decimals);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};


export const validateAptosAddress = (address: string): boolean => {
  // Aptos addresses are 64 characters long and contain only hex characters
  const aptosAddressRegex = /^[0-9a-fA-F]{64}$/;
  return aptosAddressRegex.test(address);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

type ApiErrorShape = {
  response?: { data?: { message?: string } };
  message?: string;
};

export const handleApiError = (error: unknown): string => {
  const e = error as ApiErrorShape;
  const fromResponse = e.response?.data?.message;
  if (typeof fromResponse === 'string' && fromResponse) {
    return fromResponse;
  }

  if (typeof e.message === 'string' && e.message) {
    return e.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

// Stable image URL normalizer: converts expired S3 presigned URLs to backend redirect URLs
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://api.ctomarketplace.com';

/**
 * Normalize potentially-expiring S3 URLs or raw keys to stable backend redirect URLs.
 * Supports keys stored with commas instead of slashes (legacy), e.g. "user-uploads,4,generic,foo.jpg".
 * Also supports root-level objects like "/1758901626084_meme.jfif" or "1758901626084_meme.jfif".
 */
export const normalizeImageUrl = (input?: string | null): string | undefined => {
  if (!input) return undefined;
  try {
    const raw = String(input).trim();
    if (!raw) return undefined;

    // Already backend redirect
    if (raw.includes('/api/v1/images/view/') || raw.includes('/api/images/view/')) return raw;

    // Case 1: Full URL
    try {
      const u = new URL(raw);
      const path = decodeURIComponent(u.pathname || '/');
      // Only normalize if it looks like our S3 storage key space
      const pos = path.indexOf('user-uploads');
      if (pos >= 0) {
        let key = path.substring(pos);
        key = key.replace(/^user-uploads[,/]/i, 'user-uploads/').replace(/,/g, '/');
        return `${BACKEND_URL}/api/v1/images/view/${key}`;
      }
      // If it's an external logo (dexscreener, coingecko, etc.), leave as-is
      return raw;
    } catch {
      // Not a URL, fall through to handle as raw key
    }

    // Case 2: Raw key starting with user-uploads using commas or slashes
    if (/^user-uploads[\/,]/i.test(raw)) {
      const key = raw.replace(/^user-uploads[,\/]/i, 'user-uploads/').replace(/,/g, '/');
      return `${BACKEND_URL}/api/v1/images/view/${key}`;
    }

    // Case 3: Plain filename or path — use as-is as the object key
    if (/^[^?#]+\.(?:png|jpg|jpeg|webp|gif|jfif|bmp|svg)$/i.test(raw)) {
      return `${BACKEND_URL}/api/v1/images/view/${raw.replace(/^\//, '')}`;
    }

    return raw;
  } catch {
    return undefined;
  }
};

// Build multiple candidate URLs for an image, trying different key shapes
export const buildImageCandidates = (input?: string | null): string[] => {
  const out: string[] = [];
  const add = (v?: string) => { if (v && !out.includes(v)) out.push(v); };
  if (!input) return out;

  // Always try the raw input first (e.g., direct CloudFront URL)
  const rawInput = String(input).trim();
  add(rawInput);

  // Primary normalized
  add(normalizeImageUrl(input));

  try {
    const raw = rawInput;
    // If we have a URL, extract path + basename
    try {
      const u = new URL(raw);
      const path = decodeURIComponent(u.pathname || '/');
      const pos = path.indexOf('user-uploads');
      if (pos >= 0) {
        const key = path.substring(pos).replace(/^user-uploads[,/]/i, 'user-uploads/').replace(/,/g, '/');
        add(`${BACKEND_URL}/api/v1/images/view/${key}`);
      }
      const base = path.split(/[\/]/).filter(Boolean).pop();
      if (base) add(`${BACKEND_URL}/api/v1/images/view/${base}`);
    } catch {
      // not a URL; treat as raw key or filename
      // If looks like user-uploads with commas, also try slash form
      if (/^user-uploads[,\/]/i.test(raw)) {
        const slashKey = raw.replace(/^user-uploads[,\/]/i, 'user-uploads/').replace(/,/g, '/');
        add(`${BACKEND_URL}/api/v1/images/view/${slashKey}`);
      }
      // Basename fallback
      const base = raw.split(/[\/ ,]/).filter(Boolean).pop();
      if (base && /\.(png|jpg|jpeg|webp|gif|jfif|bmp|svg)$/i.test(base)) {
        add(`${BACKEND_URL}/api/v1/images/view/${base}`);
      }
    }
  } catch {}

  return out;
};
