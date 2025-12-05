import { EUserRole } from '@shared/constants';

export const FEATURE_VISIBILITY_CONFIG = {
  attendance: {
    clientName: {
      [EUserRole.DRIVER]: false,
      [EUserRole.ENGINEER]: true,
      [EUserRole.SENIOR_SOFTWARE_ENGINEER]: false,
    },
    associateEngineerName: {
      [EUserRole.DRIVER]: true,
      [EUserRole.ENGINEER]: false,
      [EUserRole.SENIOR_SOFTWARE_ENGINEER]: true,
    },
  },
} as const;
