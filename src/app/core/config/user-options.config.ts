import { UserOption } from '@shared/types';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

/**
 * Primary user menu options
 */
export const primaryUserOptions: UserOption[] = [
  {
    id: 'profile',
    label: 'My Profile',
    icon: ICONS.EMPLOYEE.USER,
    path: `${ROUTE_BASE_PATHS.EMPLOYEE}/${ROUTES.EMPLOYEE.MY_PROFILE}`,
  },
];

/**
 * Secondary user menu options
 */
export const secondaryUserOptions: UserOption[] = [
  {
    id: 'theme',
    label: 'Dark Mode',
    icon: ICONS.THEME.MOON,
    variant: 'theme',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: ICONS.ACTIONS.POWER_OFF,
    variant: 'danger',
  },
];
