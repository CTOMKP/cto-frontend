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

// import React, { useEffect, useRef, memo } from 'react';

// interface ChartProps {
//   address?: string;
//   chain?: string;
// }

// function Chart({ address, chain }: ChartProps) {
//   const container = useRef<HTMLDivElement>(null);

//   useEffect(
//     () => {
//       const containerElement = container.current;
//       if (!containerElement) return;
      
//       const script = document.createElement("script");
//       script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
//       script.type = "text/javascript";
//       script.async = true;
//       script.innerHTML = `
//         {
//           "allow_symbol_change": true,
//           "calendar": false,
//           "details": false,
//           "hide_side_toolbar": true,
//           "hide_top_toolbar": false,
//           "hide_legend": false,
//           "hide_volume": false,
//           "hotlist": false,
//           "interval": "D",
//           "locale": "en",
//           "save_image": true,
//           "style": "1",
//           "symbol": "${address}",
//           "theme": "dark",
//           "timezone": "Etc/UTC",
//           "backgroundColor": "#0F0F0F",
//           "gridColor": "rgba(242, 242, 242, 0.06)",
//           "watchlist": [],
//           "withdateranges": false,
//           "compareSymbols": [],
//           "studies": [],
//           "autosize": true
//         }`;
//       containerElement.appendChild(script);
//     },
//     []
//   );
//   // Map chain names to gmgn format (lowercase)
//   const getGmgnChain = (chainName?: string): string => {
//     if (!chainName) return "sol"; // default to solana
    
//     const chainMap: Record<string, string> = {
//       'solana': 'sol',
//       'ethereum': 'eth',
//       'bsc': 'bsc',
//       'base': 'base',
//       'aptos': 'aptos',
//       'sui': 'sui',
//       'near': 'near',
//       'osmosis': 'osmosis',
//     };
    
//     return chainMap[chainName.toLowerCase()] || chainName.toLowerCase();
//   };

//   // Default address if not provided
//   const chartAddress = address || "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump";
//   const gmgnChain = getGmgnChain(chain);
  
//   const iframeSrc = `https://www.gmgn.cc/kline/${gmgnChain}/${chartAddress}?theme=dark&interval=60`;

//   return (
//     <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
//       <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
//       <div className="tradingview-widget-copyright"><a href={`https://www.tradingview.com/symbols/${address}/`} rel="noopener nofollow" target="_blank"><span className="blue-text">${address} stock chart</span></a><span className="trademark"> by TradingView</span></div>
//     </div>
//   );
// }

// export default memo(Chart);

