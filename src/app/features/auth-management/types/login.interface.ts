import { IAppPermission } from '@features/settings-management/permission-management/sub-features/user-permission-management/types/user-permission.interface';

export interface ILoggedInUserDetails {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  designation: string;
  profilePicture: string;
  permissions: IAppPermission;
  roles: string[];
  activeRole: string;
  /** Login-only account (no employee profile), e.g. an accounts user. */
  isSystemUser?: boolean;
}

export interface IImpersonationSession {
  accessToken: string;
  refreshToken: string;
  user: ILoggedInUserDetails;
}
