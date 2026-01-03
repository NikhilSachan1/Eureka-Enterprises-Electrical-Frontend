import {
  getRandomItem,
  getRandomNumber,
  TEST_CARD_NAMES,
} from './mock-data.constants';

export const ADD_PETRO_CARD_PREFILLED_DATA: Record<string, unknown> = {
  cardName: getRandomItem(TEST_CARD_NAMES),
  cardNumber: `${getRandomNumber(16, 'exact')}`,
};
