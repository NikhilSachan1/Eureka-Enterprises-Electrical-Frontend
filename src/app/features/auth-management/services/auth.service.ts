import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { ApiService, AppPermissionService } from '@core/services';
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
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
        }
      } else {
        this.clearAuthState();
      }
    } catch {
      this.clearAuthState();
    }
  }

  login(formData: ILoginFormDto): Observable<ILoginResponseDto> {
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
        catchError(error => {
          this.clearAuthState();
          return throwError(() => error);
        })
      );
  }

  forgetPassword(
    formData: IForgetPasswordFormDto
  ): Observable<IForgetPasswordResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.FORGOT_PASSWORD,
        {
          response: ForgetPasswordResponseSchema,
          request: ForgetPasswordRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  resetPassword(
    formData: IResetPasswordFormDto,
    token: string
  ): Observable<IResetPasswordResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.RESET_PASSWORD(token),
        {
          response: ResetPasswordResponseSchema,
          request: ResetPasswordRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  logout(): Observable<ILogoutResponseDto> {
    const currentRefreshToken = this.getRefreshToken();

    if (!currentRefreshToken) {
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
        tap(() => {
          this.clearAuthState();
        }),
        catchError(error => {
          this.clearAuthState();
          return throwError(() => error);
        })
      );
  }

  switchActiveRole(
    formData: ISwitchActiveRoleFormDto
  ): Observable<ISwitchActiveRoleResponseDto> {
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
        }),
        catchError(error => throwError(() => error))
      );
  }

  refreshAccessToken(): Observable<IRefreshTokenResponseDto> {
    const currentRefreshToken = this.getRefreshToken();

    if (!currentRefreshToken) {
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
          this._accessToken.set(response.accessToken);
          this._refreshToken.set(response.refreshToken);

          this.updateDetailsInStorage(
            response.accessToken,
            response.refreshToken
          );
        }),
        catchError(error => throwError(() => error))
      );
  }

  forceLogout(): void {
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
    } catch (error) {
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
    } catch {
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
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
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
        }),
        catchError(() => {
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
  }
}
