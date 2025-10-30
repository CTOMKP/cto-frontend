interface ChartProps {
  address?: string;
  chain?: string;
}

export default function Chart({ address, chain }: ChartProps) {
  // Map chain names to gmgn format (lowercase)
  const getGmgnChain = (chainName?: string): string => {
    if (!chainName) return "sol"; // default to solana
    
    const chainMap: Record<string, string> = {
      'solana': 'sol',
      'ethereum': 'eth',
      'bsc': 'bsc',
      'base': 'base',
      'aptos': 'aptos',
      'sui': 'sui',
      'near': 'near',
      'osmosis': 'osmosis',
    };
    
    return chainMap[chainName.toLowerCase()] || chainName.toLowerCase();
  };

  // Default address if not provided
  const chartAddress = address || "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump";
  const gmgnChain = getGmgnChain(chain);
  
  const iframeSrc = `https://www.gmgn.cc/kline/${gmgnChain}/${chartAddress}?theme=dark&interval=60`;

  return (
    <iframe
      src={iframeSrc}
      width="100%"
      height="530"
      allowFullScreen
      className="border-none"
    ></iframe>
  );
}
