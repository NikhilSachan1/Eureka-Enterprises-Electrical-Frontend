import { IMyFileBaseResponseDto } from './my-files.dto';

export interface IMyFile extends Omit<IMyFileBaseResponseDto, 'type' | 'size'> {
  itemIcon: string;
  formattedSize: string;
  documentKeys: string[];
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
