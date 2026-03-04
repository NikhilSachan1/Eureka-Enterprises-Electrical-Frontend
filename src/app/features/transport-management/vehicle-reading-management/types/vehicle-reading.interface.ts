import { IVehicleReadingGetBaseResponseDto } from './vehicle-reading.dto';

export interface IVehicleReading
  extends Pick<IVehicleReadingGetBaseResponseDto, 'id'> {
  originalRawData: IVehicleReadingGetBaseResponseDto;
}
