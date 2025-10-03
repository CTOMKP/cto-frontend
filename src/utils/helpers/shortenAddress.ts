export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};


