import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import {
  ApiService,
  LoggerService,
  AppPermissionService,
} from '@core/services';
import {
  AttachmentsService,
  AvatarService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { API_ROUTES } from '@core/constants';
import { ILoggedInUserDetails } from '../types/login.interface';
import {
  IForgetPasswordFormDto,
  IForgetPasswordResponseDto,
  ILoginFormDto,
  ILoginResponseDto,
  ILogoutFormDto,
  ILogoutResponseDto,
  IRefreshTokenFormDto,
  IRefreshTokenResponseDto,
  IResetPasswordFormDto,
  IResetPasswordResponseDto,
  ISwitchActiveRoleFormDto,
  ISwitchActiveRoleResponseDto,
} from '../types/auth.dto';
import {
  ForgetPasswordRequestSchema,
  ForgetPasswordResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  SwitchActiveRoleRequestSchema,
  SwitchActiveRoleResponseSchema,
} from '../schemas';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { EUserRole } from '@shared/constants/role.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly logger = inject(LoggerService);
  private readonly avatarService = inject(AvatarService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appPermissionService = inject(AppPermissionService);

  public readonly loggedInUserInitials = computed(() =>
    this.getLoggedInUserInitials()
  );
  public readonly loggedInUserShortName = computed(() =>
    this.getLoggedInUserShortName()
  );
  public readonly loggedInUserAvatar = computed(() => {
    const avatarUrl = this._userAvatarUrl();
    if (avatarUrl) {
      return avatarUrl;
    }

    return this.getLoggedInUserAvatar();
  });

  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _user = signal<ILoggedInUserDetails | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);
  private readonly _userAvatarUrl = signal<string>('');

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private isRefreshing = false;
  private lastLoadedProfilePicture: string | null = null;

  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly user = this._user.asReadonly();
  public readonly accessToken = this._accessToken.asReadonly();
  public readonly refreshToken = this._refreshToken.asReadonly();

  constructor() {
    this.initializeAuthState();

    effect(() => {
      const user = this._user();
      const currentProfilePicture = user?.profilePicture ?? null;

      if (currentProfilePicture !== this.lastLoadedProfilePicture) {
        if (currentProfilePicture) {
          this.loadUserProfilePicture(currentProfilePicture);
        } else {
          this._userAvatarUrl.set('');
        }
        this.lastLoadedProfilePicture = currentProfilePicture;
      }
    });
  }

  private initializeAuthState(): void {
    try {
      const accessToken = this.getStoredToken();
      const refreshTokenValue = this.getStoredRefreshToken();
      const user = this.getStoredUser();

      if (accessToken && refreshTokenValue && user) {
        this._accessToken.set(accessToken);
        this._refreshToken.set(refreshTokenValue);
        this._user.set(user);
        this._isAuthenticated.set(true);

        if (user.permissions && Array.isArray(user.permissions)) {
          this.appPermissionService.setPermissions(user.permissions);
          this.logger.info('User permissions restored from storage', {
            permissionCount: user.permissions.length,
          });
        }

        this.logger.info('User authentication state restored from storage');
      } else {
        this.clearAuthState();
      }
    } catch (error) {
      this.logger.error('Error initializing auth state', error);
      this.clearAuthState();
    }
  }

  login(formData: ILoginFormDto): Observable<ILoginResponseDto> {
    this.logger.logUserAction('Login Attempt');

    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.LOGIN,
        {
          response: LoginResponseSchema,
          request: LoginRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ILoginResponseDto) => {
          this.logger.logUserAction('Login Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Login Error', error);
          } else {
            this.logger.logUserAction('Login Error', error);
          }
          this.clearAuthState();
          return throwError(() => error);
        })
      );
  }

  forgetPassword(
    formData: IForgetPasswordFormDto
  ): Observable<IForgetPasswordResponseDto> {
    this.logger.logUserAction('Forget Password Attempt');

    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.FORGOT_PASSWORD,
        {
          response: ForgetPasswordResponseSchema,
          request: ForgetPasswordRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IForgetPasswordResponseDto) => {
          this.logger.logUserAction('Forget Password Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Forget Password Error', error);
          } else {
            this.logger.logUserAction('Forget Password Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  resetPassword(
    formData: IResetPasswordFormDto,
    token: string
  ): Observable<IResetPasswordResponseDto> {
    this.logger.logUserAction('Reset Password Attempt');

    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.RESET_PASSWORD(token),
        {
          response: ResetPasswordResponseSchema,
          request: ResetPasswordRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IResetPasswordResponseDto) => {
          this.logger.logUserAction('Reset Password Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Reset Password Error', error);
          } else {
            this.logger.logUserAction('Reset Password Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<ILogoutResponseDto> {
    const currentRefreshToken = this.getRefreshToken();

    if (!currentRefreshToken) {
      this.logger.warn('No refresh token available');
      this.clearAuthState();
      return throwError(() => new Error('No refresh token available'));
    }

    const formData: ILogoutFormDto = {
      refreshToken: currentRefreshToken,
    };

    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.LOGOUT,
        {
          response: LogoutResponseSchema,
          request: LogoutRequestSchema,
        },
        formData
      )
      .pipe(
        delay(2000),
        tap((response: ILogoutResponseDto) => {
          this.logger.logUserAction('Logout Response', response);
          this.clearAuthState();
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Logout Error', error);
          } else {
            this.logger.logUserAction('Logout Error', error);
          }
          this.clearAuthState();
          return throwError(() => error);
        })
      );
  }

  switchActiveRole(
    formData: ISwitchActiveRoleFormDto
  ): Observable<ISwitchActiveRoleResponseDto> {
    this.logger.logUserAction('Switch Active Role Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.SWITCH_ACTIVE_ROLE,
        {
          response: SwitchActiveRoleResponseSchema,
          request: SwitchActiveRoleRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ISwitchActiveRoleResponseDto) => {
          this.logger.logUserAction('Switch Active Role Response', response);
          this._accessToken.set(response.accessToken);

          const currentUser = this._user();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              activeRole: response.activeRole,
              roles: response.roles,
            };
            this._user.set(updatedUser);
            this.updateDetailsInStorage(
              response.accessToken,
              undefined,
              updatedUser
            );
          }

          this.logger.info('Active role switched successfully', {
            newRole: response.activeRole,
          });
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Switch Active Role Error',
              error
            );
          } else {
            this.logger.logUserAction('Switch Active Role Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  refreshAccessToken(): Observable<IRefreshTokenResponseDto> {
    const currentRefreshToken = this.getRefreshToken();

    if (!currentRefreshToken) {
      this.logger.warn('No refresh token available');
      this.clearAuthState();
      return throwError(() => new Error('No refresh token available'));
    }

    const formData: IRefreshTokenFormDto = {
      refreshToken: currentRefreshToken,
    };

    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.REFRESH_TOKEN,
        {
          response: RefreshTokenResponseSchema,
          request: RefreshTokenRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRefreshTokenResponseDto) => {
          this.logger.info('Token refreshed successfully');

          this._accessToken.set(response.accessToken);
          this._refreshToken.set(response.refreshToken);

          this.updateDetailsInStorage(
            response.accessToken,
            response.refreshToken
          );
        }),
        catchError(error => {
          this.logger.error('Failed to refresh token', error);
          return throwError(() => error);
        })
      );
  }

  forceLogout(): void {
    this.logger.warn('Force logout: Session expired, redirecting to login');
    this.clearAuthState();
    this.refreshTokenSubject = new BehaviorSubject<string | null>(null);
    this.notificationService.error(
      'Your session has expired. Please sign in again.'
    );
    void this.routerNavigationService.navigateToRoute([
      ROUTE_BASE_PATHS.AUTH,
      ROUTES.AUTH.LOGIN,
    ]);
  }

  setAuthState(loginResponse: ILoginResponseDto, rememberMe: boolean): void {
    try {
      const {
        accessToken,
        refreshToken,
        userId,
        firstName,
        lastName,
        email,
        name,
        designation,
        profilePicture,
        roles,
        activeRole,
      } = loginResponse;

      const user: ILoggedInUserDetails = {
        userId,
        firstName,
        lastName,
        email,
        fullName: name,
        designation,
        profilePicture: profilePicture ?? '',
        permissions: [],
        roles,
        activeRole,
      };

      this._accessToken.set(accessToken);
      this._refreshToken.set(refreshToken);
      this._user.set(user);
      this._isAuthenticated.set(true);

      this.updateDetailsInStorage(accessToken, refreshToken, user, rememberMe);

      this.logger.info('Login successful', user);
    } catch (error) {
      this.logger.error('Error handling login success', error);
      this.clearAuthState();
      throw error;
    }
  }

  isTokenRefreshing(): boolean {
    return this.isRefreshing;
  }

  setRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }

  getRefreshTokenSubject(): BehaviorSubject<string | null> {
    return this.refreshTokenSubject;
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  /**
   * Get current user
   */
  getCurrentUser(): ILoggedInUserDetails | null {
    return this._user();
  }

  /**
   * Whether the **active** role is a company / managerial role (org-wide ledger, approvals, payouts).
   * False does not always mean “employee”; see {@link isActiveRoleEmployeeLike}.
   */
  isActiveRoleManagerial(): boolean {
    const role = this.getCurrentUser()?.activeRole;
    if (!role) {
      return false;
    }
    return (
      role === EUserRole.ADMIN ||
      role === EUserRole.SUPER_ADMIN ||
      role === EUserRole.MANAGER
    );
  }

  /**
   * Whether the **active** role is self-service staff (own records: employee or field roles).
   */
  isActiveRoleEmployeeLike(): boolean {
    const role = this.getCurrentUser()?.activeRole;
    if (!role) {
      return false;
    }
    return role === EUserRole.EMPLOYEE || role === EUserRole.DRIVER;
  }

  /**
   * Get current token
   */
  getAuthToken(): string | null {
    return this._accessToken();
  }

  /**
   * Get stored access token from localStorage or sessionStorage
   */
  private getStoredToken(): string | null {
    return (
      localStorage.getItem('access_token') ??
      sessionStorage.getItem('access_token')
    );
  }

  private getStoredRefreshToken(): string | null {
    return (
      localStorage.getItem('refresh_token') ??
      sessionStorage.getItem('refresh_token')
    );
  }

  getRefreshToken(): string | null {
    return this._refreshToken();
  }

  private getStoredUser(): ILoggedInUserDetails | null {
    try {
      const userData =
        localStorage.getItem('user_data') ??
        sessionStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      this.logger.error('Error getting stored user', error);
      this.clearAuthState();
      return null;
    }
  }

  private getActiveStorage(): Storage {
    return localStorage.getItem('access_token') ? localStorage : sessionStorage;
  }

  private updateDetailsInStorage(
    accessToken: string,
    refreshToken?: string,
    userData?: ILoggedInUserDetails,
    useLocalStorage?: boolean
  ): void {
    // For login, use the specified storage; otherwise detect from existing token
    const storage =
      useLocalStorage !== undefined
        ? useLocalStorage
          ? localStorage
          : sessionStorage
        : this.getActiveStorage();

    storage.setItem('access_token', accessToken);

    if (refreshToken) {
      storage.setItem('refresh_token', refreshToken);
    }

    if (userData) {
      storage.setItem('user_data', JSON.stringify(userData));
    }
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    // Clear signals
    this._isAuthenticated.set(false);
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._userAvatarUrl.set('');

    // Reset refresh state
    this.isRefreshing = false;
    this.refreshTokenSubject.next(null);

    // Reset profile picture tracking
    this.lastLoadedProfilePicture = null;

    // Clear storage - both localStorage and sessionStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_id');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('user_id');
  }

  private getLoggedInUserInitials(): string {
    const user = this._user();
    if (!user) {
      return '';
    }
    const firstInitial = user.firstName.charAt(0).toUpperCase();
    const lastInitial = user.lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  private getLoggedInUserShortName(): string {
    const user = this._user();
    return user ? user.firstName : '';
  }

  private getLoggedInUserAvatar(): string {
    const user = this._user();
    return this.avatarService.getAvatarFromName(user?.fullName ?? '');
  }

  private loadUserProfilePicture(profilePicture: string): void {
    this.attachmentsService
      .getFullMediaUrl(profilePicture)
      .pipe(
        tap(response => {
          this._userAvatarUrl.set(response.url);
          this.logger.info('User profile picture loaded', response.url);
        }),
        catchError(error => {
          this.logger.error('Failed to load profile picture', error);
          this._userAvatarUrl.set('');
          return of(null);
        })
      )
      .subscribe();
  }

  updateUserDetails(updates: {
    firstName?: string;
    lastName?: string;
    designation?: string;
    profilePicture?: string;
  }): void {
    const currentUser = this._user();
    if (!currentUser) {
      this.logger.warn('Cannot update user details: No user logged in');
      return;
    }

    const updatedUser: ILoggedInUserDetails = {
      ...currentUser,
      firstName: updates.firstName ?? currentUser.firstName,
      lastName: updates.lastName ?? currentUser.lastName,
      designation: updates.designation ?? currentUser.designation,
      profilePicture: updates.profilePicture ?? currentUser.profilePicture,
      fullName: `${updates.firstName ?? currentUser.firstName} ${updates.lastName ?? currentUser.lastName}`,
    };

    // Update signal
    this._user.set(updatedUser);

    // Update storage
    const storage = localStorage.getItem('user_data')
      ? localStorage
      : sessionStorage;
    storage.setItem('user_data', JSON.stringify(updatedUser));

    this.logger.info('User details updated successfully', updatedUser);
  }
}
