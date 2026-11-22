/** Colour family of an item's icon tile (drives the card accent). */
export type TMyFileTone =
  | 'folder'
  | 'pdf'
  | 'image'
  | 'spreadsheet'
  | 'document'
  | 'presentation'
  | 'file';

/** How the folder contents are laid out. */
export type TMyFilesViewMode = 'grid' | 'list';

/** What an item's ⋮ menu can do. */
export type TMyFileItemAction =
  | 'open'
  | 'download'
  | 'rename'
  | 'move'
  | 'delete';
