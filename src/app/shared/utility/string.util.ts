export const toTitleCase = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const toUpperCase = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text.toLocaleUpperCase();
};

export const toLowerCase = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text.toLocaleLowerCase();
};

export const toCapitalize = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const toSentenceCase = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const stringToArray = (text: string, separator: string = ' '): string[] => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  return text.split(separator);
};

export const replaceTextWithSeparator = (text: string, replaceText: string, separator: string = ' '): string => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text.replace(replaceText, separator);
};