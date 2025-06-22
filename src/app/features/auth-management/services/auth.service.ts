import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize, map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import { API_ROUTES } from '../../../core/constants/api.constants';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../shared/constants';
import { ILoggedInUserDetails } from '../models/logged-in-user.model';
import { ILoginRequestDto, ILoginResponseDto } from '../models/auth-api.model';
import { LoginRequestSchema, LoginResponseSchema } from '../dto/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  // Signal-based state management
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _user = signal<ILoggedInUserDetails | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly user = this._user.asReadonly();
  public readonly token = this._token.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();

  public readonly loggedInUserInitials = computed(() => {
    const user = this._user();
    if (!user) return '';
    const firstInitial = user.firstName.charAt(0).toUpperCase();
    const lastInitial = user.lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  });

  public readonly loggedInUserShortName = computed(() => {  
    const user = this._user();
    return user ? user.firstName : '';
  });

  public readonly loggedInUserAvatar = computed(() => {
    const user = this._user();
    let avatarUrl = '';
    console.log(user);
    if(!user || !user.avatarUrl) {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || '')}`;
    } else {
      avatarUrl = user.avatarUrl;
    }

    return avatarUrl;
  });

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from localStorage
   */
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

  login(formData: ILoginRequestDto, rememberMe: boolean): Observable<ILoginResponseDto> {
    this._isLoading.set(true);
    this.logger.logUserAction('Login Attempt', formData);

    return this.apiService.postValidated(
      API_ROUTES.AUTH.LOGIN,
      formData,
      LoginRequestSchema,
      LoginResponseSchema
    ).pipe(
      tap((response: ILoginResponseDto) => {
        this.handleLoginSuccess(response, rememberMe);
      }),
      catchError((error) => {
        this.clearAuthState(); // Only handle business logic
        return throwError(() => error);
      }),
      finalize(() => {
        this._isLoading.set(false);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    try {
      this.logger.logUserAction('User Logout');
      
      // Clear authentication state
      this.clearAuthState();
      
      // Navigate to login page
      this.router.navigate([`/${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`]);
      
      this.logger.info('User logged out successfully');
    } catch (error) {
      this.logger.error('Error during logout', error);
    }
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
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  private getStoredUser(): ILoggedInUserDetails | null {
    try {
      const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      this.logger.error('Error getting stored user', error);
      this.clearAuthState();
      return null;
    }
  }

  /**
   * Handle successful login
   */
  private handleLoginSuccess(response: ILoginResponseDto, rememberMe = false): void {
    try {
      const { token, firstName, lastName, email, name, designation } = response;

      const user: ILoggedInUserDetails = {
        firstName,
        lastName,
        email,
        fullName: name,
        designation: designation,
        avatarUrl: ''
      };

      // Update signals
      this._token.set(token);
      this._user.set(user);
      this._isAuthenticated.set(true);

      // Store in localStorage/sessionStorage based on rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('auth_token', token);
      storage.setItem('user_data', JSON.stringify(user));

      this.logger.info('Login successful', user);
      this.navigateAfterLogin();
    } catch (error) {
      this.logger.error('Error handling login success', error);
      this.clearAuthState();
      throw error;
    }
  }



  private navigateAfterLogin(): void {
    try {
      // Check for stored redirect URL
      const redirectUrl = sessionStorage.getItem('auth_redirect_url');
      
      if (redirectUrl) {
        this.logger.info(`Redirecting to stored URL: ${redirectUrl}`);
        sessionStorage.removeItem('auth_redirect_url');
        this.router.navigateByUrl(redirectUrl);
      } else {
        this.logger.info('No valid redirect URL found, navigating to dashboard');
        this.router.navigate([`/${ROUTE_BASE_PATHS.DASHBOARD}`]);
      }
    } catch (error) {
      this.logger.error('Error during post-login navigation', error);
      // Fallback to dashboard
      this.router.navigate([`/${ROUTE_BASE_PATHS.DASHBOARD}`]);
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
} 