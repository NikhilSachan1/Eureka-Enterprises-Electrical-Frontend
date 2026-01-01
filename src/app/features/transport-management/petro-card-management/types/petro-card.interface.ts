import { IPetroCardGetBaseResponseDto } from './petro-card.dto';

export interface IPetroCard
  extends Omit<
    IPetroCardGetBaseResponseDto,
    'cardType' | 'holderName' | 'expiryDate' | 'expiryStatus'
  > {
  vehicleNumber: string;
  vehicleName: string;
  addedBy: string;
  employeeId: string;
  originalRawData: IPetroCardGetBaseResponseDto;
}
