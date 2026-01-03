import { IPetroCardGetBaseResponseDto } from './petro-card.dto';

export interface IPetroCard
  extends Pick<IPetroCardGetBaseResponseDto, 'cardNumber' | 'cardName'> {
  originalRawData: IPetroCardGetBaseResponseDto;
}
