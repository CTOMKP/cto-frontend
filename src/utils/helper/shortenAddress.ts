export function shortenAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}
