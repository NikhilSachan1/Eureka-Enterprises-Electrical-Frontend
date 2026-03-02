import {
  IVehicleServiceDetailGetResponseDto,
  IVehicleServiceGetBaseResponseDto,
} from './vehicle-service.dto';

export interface IVehicleService
  extends Pick<
    IVehicleServiceGetBaseResponseDto,
    | 'id'
    | 'vehicle'
    | 'serviceDate'
    | 'odometerReading'
    | 'serviceType'
    | 'serviceCost'
    | 'remarks'
  > {
  vehicleName: string;
  serviceFiles: string[];
  originalRawData: IVehicleServiceGetBaseResponseDto;
}

export interface IVehicleServiceDetailResolverResponse
  extends IVehicleServiceDetailGetResponseDto {
  preloadedFiles?: File[];
}
