export const formatBalance = (balance: string, decimals: number): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  
  // For very small numbers, show more decimal places
  if (num < 0.000001) {
    return num.toFixed(decimals);
  }
  
  // For larger numbers, show appropriate decimal places
  if (num < 1) {
    return num.toFixed(6);
  } else if (num < 100) {
    return num.toFixed(4);
  } else if (num < 10000) {
    return num.toFixed(2);
  } else {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
};










