import { IAppPermission } from '@features/settings-management/permission-management/sub-features/user-permission-management/types/user-permission.interface';

export interface ILoggedInUserDetails {
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  designation: string;
  profilePicture: string;
  permissions: IAppPermission;
}
