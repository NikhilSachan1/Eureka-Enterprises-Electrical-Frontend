import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { ApiService, LoggerService } from '@core/services';
import { AvatarService } from '@shared/services';
import { API_ROUTES } from '@core/constants';
import { ILoggedInUserDetails } from '../models/logged-in-user.model';
import { ILoginRequestDto, ILoginResponseDto } from '../models/auth-api.model';
import { LoginRequestSchema, LoginResponseSchema } from '../dto/auth.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly avatarService = inject(AvatarService);

  public readonly loggedInUserInitials = computed(() =>
    this.getLoggedInUserInitials()
  );
  public readonly loggedInUserShortName = computed(() =>
    this.getLoggedInUserShortName()
  );
  public readonly loggedInUserAvatar = computed(() =>
    this.getLoggedInUserAvatar()
  );

  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _user = signal<ILoggedInUserDetails | null>(null);
  private readonly _token = signal<string | null>(null);

  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly user = this._user.asReadonly();
  public readonly token = this._token.asReadonly();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    try {
      const token = this.getStoredToken();
      const user = this.getStoredUser();

      if (token && user) {
        this._token.set(token);
        this._user.set(user);
        this._isAuthenticated.set(true);

        this.logger.info('User authentication state restored from storage');
      } else {
        this.clearAuthState();
      }
    } catch (error) {
      this.logger.error('Error initializing auth state', error);
      this.clearAuthState();
    }
  }

  login(formData: ILoginRequestDto): Observable<ILoginResponseDto> {
    this.logger.logUserAction('Login Attempt');

    return this.apiService
      .postValidated(
        API_ROUTES.AUTH.LOGIN,
        formData,
        LoginRequestSchema,
        LoginResponseSchema
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

  setAuthState(loginResponse: ILoginResponseDto, rememberMe: boolean): void {
    try {
      const {
        token,
        firstName,
        lastName,
        email,
        name,
        designation,
        profilePicture,
      } = loginResponse;

      const user: ILoggedInUserDetails = {
        firstName,
        lastName,
        email,
        fullName: name,
        designation,
        profilePicture: profilePicture ?? '',
        permissions: [],
      };

      this._token.set(token);
      this._user.set(user);
      this._isAuthenticated.set(true);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('auth_token', token);
      storage.setItem('user_data', JSON.stringify(user));

      this.logger.info('Login successful', user);
    } catch (error) {
      this.logger.error('Error handling login success', error);
      this.clearAuthState();
      throw error;
    }
  }

  logout(): Observable<null> {
    return of(null).pipe(
      tap(() => {
        this.logger.logUserAction('User Logout');

        this.clearAuthState();

        this.logger.info('User logged out successfully');
      }),
      catchError(error => {
        this.logger.error('Error during logout', error);
        throw error;
      }),
      delay(2000)
    );
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
    return this._token();
  }

  /**
   * Get stored token
   */
  private getStoredToken(): string | null {
    return (
      localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token')
    );
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
  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    // Clear signals
    this._isAuthenticated.set(false);
    this._user.set(null);
    this._token.set(null);

    // Clear storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('auth_token');
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
    let profilePicture = '';
    if (!user?.profilePicture) {
      profilePicture = this.avatarService.getAvatarFromName(
        user?.fullName ?? ''
      );
    } else {
      profilePicture = user.profilePicture;
    }

    return profilePicture;
  }
}
