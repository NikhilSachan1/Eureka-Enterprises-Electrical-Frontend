import { UserOption } from '../../shared/models';

/**
 * Primary user menu options
 */
export const primaryUserOptions: UserOption[] = [
  {
    id: 'profile',
    label: 'My Profile',
    icon: 'pi pi-user',
    path: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'pi pi-cog',
    path: '/settings'
  },
  {
    id: 'reset-password',
    label: 'Reset Password',
    icon: 'pi pi-lock',
    path: '/reset-password'
  }
];

/**
 * Secondary user menu options
 */
export const secondaryUserOptions: UserOption[] = [
  {
    id: 'theme',
    label: 'Dark Mode',
    icon: 'pi pi-moon',
    variant: 'theme'
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: 'pi pi-power-off',
    variant: 'danger'
  }
]; 