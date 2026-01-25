"use client";

export default function TxHistoryTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left">
            <th className="text-xs font-bold text-white/50 py-2 pr-4">Timestamp</th>
            <th className="text-xs font-bold text-white/50 py-2 pr-4">Value (USDC)</th>
            <th className="text-xs font-bold text-white/50 py-2 pr-4">Amount</th>
            <th className="text-xs font-bold text-white/50 py-2 pr-4">Type</th>
            <th className="text-xs font-bold text-white/50 py-2 pr-4">Address</th>
            <th className="text-xs font-bold text-white/50 py-2 pr-0 text-right">Hash ID</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={index} className="bg-white/5">
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">
                <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
              </td>
              <td className="py-3 pr-0 whitespace-nowrap text-right">
                <div className="h-4 w-4 rounded bg-white/10 animate-pulse inline-block ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
