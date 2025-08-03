export const convertSecondsToDhms = (seconds: number): string => {
  if (!seconds || seconds < 0) {
    return '00:00:00';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};

const pad = (num: number): string => {
  return num.toString().padStart(2, '0');
};
