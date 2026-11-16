import { APP_CONFIG } from '@core/config/app.config';

export const isAllowedUploadFileType = (
  file: File,
  allowedFileTypes: string[]
): boolean => {
  const extension = getFileExtension(file.name);
  if (!extension) {
    return false;
  }

  const allowed = allowedFileTypes.map(type => type.toLowerCase());
  return allowed.includes(extension);
};

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

/** Formats Microsoft's Office viewer can show (it downloads the file from the given URL). */
const OFFICE_VIEWER_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
const OFFICE_VIEWER_BASE =
  'https://view.officeapps.live.com/op/embed.aspx?src=';

/**
 * Office viewer URL for a Word / Excel / PowerPoint file, or null for anything else.
 * The file URL must be reachable from the internet (our signed S3 links are).
 */
export const getOfficeViewerUrl = (
  fileUrl: string,
  extension: string
): string | null =>
  fileUrl && OFFICE_VIEWER_EXTENSIONS.includes(extension.toLowerCase())
    ? `${OFFICE_VIEWER_BASE}${encodeURIComponent(fileUrl)}`
    : null;
