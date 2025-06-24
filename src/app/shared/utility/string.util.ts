export function toTitleCase(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
