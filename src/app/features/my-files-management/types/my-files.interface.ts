import { IMyFileBaseResponseDto } from './my-files.dto';

export interface IMyFile extends Omit<IMyFileBaseResponseDto, 'type' | 'size'> {
  itemIcon: string;
  itemKind: string;
  iconTone: 'folder' | 'pdf' | 'image' | 'spreadsheet' | 'document' | 'file';
  formattedSize: string;
  originalRawData: IMyFileBaseResponseDto;
}

export interface IMyFilesMoveFolderTreeItem {
  id: string;
  name: string;
}

export interface IMoveMyFileDrawerData {
  itemToMove: IMyFileBaseResponseDto;
  onSuccess: (destinationParentId: string | null) => void;
}
