import {
  IVehicleDetailGetResponseDto,
  IVehicleEventHistoryGetBaseResponseDto,
  IVehicleGetBaseResponseDto,
} from './vehicle.dto';

export interface IVehicle
  extends Pick<
    IVehicleGetBaseResponseDto,
    'id' | 'status' | 'insuranceStatus' | 'pucStatus' | 'latestEvent'
  > {
  vehicleNumber: string;
  vehicleName: string;
  vehicleAssigneeName: string | null;
  vehicleAssigneeCode: string | null;
  vehicleDocuments: string[];
  serviceStatus: string;
  petroCardNumber: string | null;
  petroCardName: string | null;
  originalRawData: IVehicleGetBaseResponseDto;
}

export interface IVehicleDetailResolverResponse
  extends IVehicleDetailGetResponseDto {
  preloadedFiles?: File[];
}

export interface IVehicleEventHistory
  extends Omit<
    IVehicleEventHistoryGetBaseResponseDto,
    | 'vehicleMasterId'
    | 'fromUserId'
    | 'toUserId'
    | 'updatedAt'
    | 'vehicle'
    | 'metadata'
    | 'id'
    | 'createdById'
    | 'createdByUser'
    | 'fromUserDetails'
    | 'toUserDetails'
  > {
  remarks: string;
  // From User - who transferred the vehicle
  fromUserName: string | null;
  fromUserCode: string | null;
  // To User - who received the vehicle
  toUserName: string | null;
  toUserCode: string | null;
  // Created By - who created this event
  createdByName: string;
  createdByCode: string;
}
