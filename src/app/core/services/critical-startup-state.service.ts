import { Injectable, signal } from '@angular/core';
import { ROUTE_BASE_PATHS } from '@shared/constants';

@Injectable({
  providedIn: 'root',
})
export class CriticalStartupStateService {
  private readonly STORAGE_KEY = 'critical_startup_failed';
  private readonly REDIRECT_URL_STORAGE_KEY = 'critical_startup_redirect_url';
  private readonly startupErrorPath = `/${ROUTE_BASE_PATHS.STARTUP_ERROR}`;
  private readonly _criticalLoadFailed = signal(
    sessionStorage.getItem(this.STORAGE_KEY) === '1'
  );

  readonly criticalLoadFailed = this._criticalLoadFailed.asReadonly();

  markCriticalLoadFailed(): void {
    this._criticalLoadFailed.set(true);
    sessionStorage.setItem(this.STORAGE_KEY, '1');
  }

  getCurrentUrl(): string {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  getStartupErrorPath(): string {
    return this.startupErrorPath;
  }

  isStartupErrorPath(pathname: string = window.location.pathname): boolean {
    return pathname.startsWith(this.startupErrorPath);
  }

  buildStartupErrorUrl(redirectUrl: string): string {
    return `${this.startupErrorPath}?redirect=${encodeURIComponent(redirectUrl)}`;
  }

  markFailedAndBuildRedirectUrl(redirectUrl: string): string {
    this.markCriticalLoadFailed();
    this.setRedirectUrl(redirectUrl);
    return this.buildStartupErrorUrl(redirectUrl);
  }

  setRedirectUrl(url: string): void {
    if (!url || url.startsWith(this.startupErrorPath)) {
      return;
    }
    sessionStorage.setItem(this.REDIRECT_URL_STORAGE_KEY, url);
  }

  getRedirectUrl(): string | null {
    return sessionStorage.getItem(this.REDIRECT_URL_STORAGE_KEY);
  }

  clearCriticalLoadFailure(): void {
    this._criticalLoadFailed.set(false);
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.REDIRECT_URL_STORAGE_KEY);
  }
}
