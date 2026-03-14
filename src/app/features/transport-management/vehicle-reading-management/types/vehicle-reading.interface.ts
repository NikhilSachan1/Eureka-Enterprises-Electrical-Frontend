import {
  IVehicleReadingDetailGetResponseDto,
  IVehicleReadingGetBaseResponseDto,
} from './vehicle-reading.dto';

export interface IVehicleReading
  extends Pick<
    IVehicleReadingGetBaseResponseDto,
    | 'id'
    | 'totalKmTraveled'
    | 'anomalyReason'
    | 'driverRemarks'
    | 'documentKeys'
  > {
  readingDate: string;
  vehicle: IVehicleReadingGetBaseResponseDto['vehicle'] & {
    brandModel: string;
  };
  driver: IVehicleReadingGetBaseResponseDto['driver'] & {
    fullName: string;
  };
  site:
    | (IVehicleReadingGetBaseResponseDto['site'] & {
        name: string;
        location: string;
      })
    | null;
  meterReading: [number, number];
  anomalyStatus: string;
  originalRawData: IVehicleReadingGetBaseResponseDto;
}

export interface IVehicleReadingDetailResolverResponse
  extends IVehicleReadingDetailGetResponseDto {
  preloadedStartOdometerFiles?: File[];
  preloadedEndOdometerFiles?: File[];
}
