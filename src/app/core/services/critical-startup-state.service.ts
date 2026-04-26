import { Injectable, signal } from '@angular/core';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export type CriticalStartupFailureReason = 'configuration' | 'health';

@Injectable({
  providedIn: 'root',
})
export class CriticalStartupStateService {
  private readonly STORAGE_KEY = 'critical_startup_failed';
  private readonly REDIRECT_URL_STORAGE_KEY = 'critical_startup_redirect_url';
  private readonly FAILURE_REASON_STORAGE_KEY =
    'critical_startup_failure_reason';
  private readonly startupErrorPath = `/${ROUTE_BASE_PATHS.STARTUP_ERROR}`;
  private readonly _criticalLoadFailed = signal(
    sessionStorage.getItem(this.STORAGE_KEY) === '1'
  );
  private readonly _failureReason = signal<CriticalStartupFailureReason>(
    this.getStoredFailureReason()
  );

  readonly criticalLoadFailed = this._criticalLoadFailed.asReadonly();
  readonly failureReason = this._failureReason.asReadonly();

  markCriticalLoadFailed(
    reason: CriticalStartupFailureReason = 'configuration'
  ): void {
    this._criticalLoadFailed.set(true);
    this._failureReason.set(reason);
    sessionStorage.setItem(this.STORAGE_KEY, '1');
    sessionStorage.setItem(this.FAILURE_REASON_STORAGE_KEY, reason);
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

  markFailedAndBuildRedirectUrl(
    redirectUrl: string,
    reason: CriticalStartupFailureReason = 'configuration'
  ): string {
    this.markCriticalLoadFailed(reason);
    this.setRedirectUrl(redirectUrl);
    return this.buildStartupErrorUrl(redirectUrl);
  }

  setFailureReason(reason: CriticalStartupFailureReason): void {
    this._failureReason.set(reason);
    sessionStorage.setItem(this.FAILURE_REASON_STORAGE_KEY, reason);
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
    this._failureReason.set('configuration');
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.REDIRECT_URL_STORAGE_KEY);
    sessionStorage.removeItem(this.FAILURE_REASON_STORAGE_KEY);
  }

  private getStoredFailureReason(): CriticalStartupFailureReason {
    return sessionStorage.getItem(this.FAILURE_REASON_STORAGE_KEY) === 'health'
      ? 'health'
      : 'configuration';
  }
}
