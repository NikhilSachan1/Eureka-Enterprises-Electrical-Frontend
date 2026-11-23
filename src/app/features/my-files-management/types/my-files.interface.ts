import { IMyFileBaseResponseDto } from './my-files.dto';
import { TMyFileItemAction, TMyFileTone } from './my-files.types';

/** A file or folder as the My Files page shows it. */
export interface IMyFile {
  id: string;
  name: string;
  isFolder: boolean;
  icon: string;
  /** "Folder", "PDF", "Image", … */
  kind: string;
  tone: TMyFileTone;
  /** "240 KB"; empty for folders. */
  sizeLabel: string;
  /** "2d ago"; empty when the API did not send a date. */
  modifiedLabel: string;
  /** Full date and time for the tooltip. */
  modifiedTitle: string;
  raw: IMyFileBaseResponseDto;
}

/** One entry of the item ⋮ menu (config); the page adds the click handler. */
export interface IMyFileItemActionConfig {
  action: TMyFileItemAction;
  label: string;
  icon: string;
  permission?: string[];
  /** Shown for files only (e.g. Download). */
  filesOnly?: boolean;
  /** Red, destructive (Delete). */
  danger?: boolean;
  /** Drawn after a separator line. */
  separatorBefore?: boolean;
}

export interface IMyFilesMoveFolderTreeItem {
  id: string;
  name: string;
}

/** One step of the Move dialog's path ("My Files" is id null). */
export interface IMyFilesMoveCrumb {
  id: string | null;
  name: string;
}
