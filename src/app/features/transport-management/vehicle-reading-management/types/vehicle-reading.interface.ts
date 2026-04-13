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
  site: IVehicleReadingGetBaseResponseDto['site'] & {
    name: string;
    location: string;
  };
  /** [start, end] odometer; null when not filled. */
  meterReading: [number | null, number | null];
  anomalyStatus: string;
  originalRawData: IVehicleReadingGetBaseResponseDto;
}

export interface IVehicleReadingDetailResolverResponse
  extends IVehicleReadingDetailGetResponseDto {
  preloadedStartOdometerFiles?: File[];
  preloadedEndOdometerFiles?: File[];
}
