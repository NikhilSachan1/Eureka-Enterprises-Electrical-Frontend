import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import {
  formatFileSize,
  formatRelativeTime,
  getMediaTypeFromUrl,
  transformDateFormat,
} from '@shared/utility';
import { IMyFileBaseResponseDto } from '../types/my-files.dto';
import { EMyFileType } from '../types/my-files.enum';
import { IMyFile } from '../types/my-files.interface';
import { TMyFileTone } from '../types/my-files.types';

interface IAppearance {
  icon: string;
  kind: string;
  tone: TMyFileTone;
}

/** Icon, label and colour family for a file or folder (from its name's extension). */
export function resolveMyFileAppearance(
  record: Pick<IMyFileBaseResponseDto, 'type' | 'name'>
): IAppearance {
  if (record.type === EMyFileType.FOLDER) {
    return { icon: ICONS.COMMON.FOLDER, kind: 'Folder', tone: 'folder' };
  }

  switch (getMediaTypeFromUrl(record.name)) {
    case 'pdf':
      return { icon: ICONS.MEDIA.PDF, kind: 'PDF', tone: 'pdf' };
    case 'image':
      return { icon: ICONS.MEDIA.IMAGE, kind: 'Image', tone: 'image' };
    case 'document':
      return { icon: ICONS.MEDIA.DOCUMENT, kind: 'Document', tone: 'document' };
    case 'spreadsheet':
      return {
        icon: ICONS.MEDIA.SPREADSHEET,
        kind: 'Spreadsheet',
        tone: 'spreadsheet',
      };
    case 'presentation':
      return {
        icon: ICONS.MEDIA.PRESENTATION,
        kind: 'Presentation',
        tone: 'presentation',
      };
    default:
      return { icon: ICONS.COMMON.FILE, kind: 'File', tone: 'file' };
  }
}

/** "PDF" / "XLSX" badge text from the file name; empty for folders or no extension. */
export function getMyFileExtension(name: string, isFolder: boolean): string {
  if (isFolder) {
    return '';
  }

  const dot = name.lastIndexOf('.');
  return dot > 0 && dot < name.length - 1
    ? name
        .slice(dot + 1)
        .toUpperCase()
        .slice(0, 4)
    : '';
}

export function toMyFile(record: IMyFileBaseResponseDto): IMyFile {
  const isFolder = record.type === EMyFileType.FOLDER;
  const appearance = resolveMyFileAppearance(record);
  const modifiedAt = record.updatedAt ?? record.createdAt ?? null;

  return {
    id: record.id,
    name: record.name,
    isFolder,
    icon: appearance.icon,
    kind: appearance.kind,
    tone: appearance.tone,
    sizeLabel:
      isFolder || record.size === null
        ? ''
        : formatFileSize(Number(record.size)),
    modifiedLabel: formatRelativeTime(modifiedAt),
    modifiedTitle: modifiedAt
      ? (transformDateFormat(
          new Date(modifiedAt),
          APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME
        ) ?? '')
      : '',
    raw: record,
  };
}
