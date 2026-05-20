import { IMyFileBaseResponseDto } from './my-files.dto';

export interface IMyFile extends Omit<IMyFileBaseResponseDto, 'type' | 'size'> {
  itemIcon: string;
  formattedSize: string;
  originalRawData: IMyFileBaseResponseDto;
}
