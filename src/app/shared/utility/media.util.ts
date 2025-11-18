import { APP_CONFIG } from '@core/config/app.config';

export const getMediaTypeFromUrl = (url: string): string => {
  const cleanUrl = url.split('?')[0];
  const urlMediaType = cleanUrl.split('.').pop()?.toLowerCase();
  let mediaType = 'unsupported';

  if (urlMediaType) {
    if (APP_CONFIG.MEDIA_CONFIG.IMAGE.includes(urlMediaType)) {
      mediaType = 'image';
    } else if (APP_CONFIG.MEDIA_CONFIG.PDF.includes(urlMediaType)) {
      mediaType = 'pdf';
    } else if (APP_CONFIG.MEDIA_CONFIG.DOCUMENT.includes(urlMediaType)) {
      mediaType = 'document';
    } else if (APP_CONFIG.MEDIA_CONFIG.SPREADSHEET.includes(urlMediaType)) {
      mediaType = 'spreadsheet';
    } else if (APP_CONFIG.MEDIA_CONFIG.PRESENTATION.includes(urlMediaType)) {
      mediaType = 'presentation';
    }
  }

  return mediaType;
};

export const getFileExtension = (url: string): string => {
  const cleanUrl = url.split('?')[0];
  return cleanUrl.split('.').pop()?.toLowerCase() ?? '';
};
