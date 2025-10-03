export const compactNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  
  const units = ['', 'K', 'M', 'B', 'T'];
  const unitIndex = Math.floor(Math.log10(num) / 3);
  const unitValue = num / Math.pow(1000, unitIndex);
  
  return `${unitValue.toFixed(1)}${units[unitIndex]}`;
};


