export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  
  const start = address.slice(0, startChars);
  const end = address.slice(-endChars);
  return `${start}...${end}`;
};








