import { IPetroCardAddFormDto } from '@features/transport-management/petro-card-management/types/petro-card.dto';
import {
  getRandomItem,
  getRandomNumber,
  TEST_CARD_NAMES,
} from './mock-data.constants';

export const ADD_PETRO_CARD_PREFILLED_DATA: IPetroCardAddFormDto = {
  petroCardName: getRandomItem(TEST_CARD_NAMES),
  petroCardNumber: `${getRandomNumber(16, 'exact')}`,
};
