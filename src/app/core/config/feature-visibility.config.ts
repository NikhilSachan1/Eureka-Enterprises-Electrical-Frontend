import { EUserRole } from '@shared/constants';

export const FEATURE_VISIBILITY_CONFIG = {
  attendance: {
    clientName: {
      [EUserRole.DRIVER]: false,
      [EUserRole.EMPLOYEE]: true,
    },
    associateEngineerName: {
      [EUserRole.DRIVER]: true,
      [EUserRole.EMPLOYEE]: false,
    },
  },
} as const;
