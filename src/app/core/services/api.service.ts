import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, timer, BehaviorSubject } from 'rxjs';
import { retry, timeout, catchError, tap, share } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { IApiErrorResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  
  // Request deduplication cache
  private readonly requestCache = new Map<string, Observable<any>>();
  
  // Loading state for UI feedback
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  private get baseUrl(): string {
    return this.environmentService.apiBaseUrl;
  }

  private get timeout(): number {
    return this.environmentService.apiTimeout;
  }

  private get retryAttempts(): number {
    return this.environmentService.apiRetryAttempts;
  }

  get<T>(endpoint: string, params?: any, useCache = false): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    const cacheKey = useCache ? `GET:${url}:${JSON.stringify(params)}` : null;
    
    if (useCache && cacheKey && this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey)!;
    }
    
    const request$ = this.http.get<T>(url, { params: httpParams })
      .pipe(
        timeout(this.timeout),
        this.retryWithBackoff<T>(),
        tap(() => this.setLoading(false)),
        catchError(this.handleError),
        share() // Share the same observable for multiple subscribers
      );
    
    if (useCache && cacheKey) {
      this.requestCache.set(cacheKey, request$);
      // Remove from cache after cache duration
      setTimeout(() => this.requestCache.delete(cacheKey), this.environmentService.cacheConfig.duration);
    }
    
    this.setLoading(true);
    return request$;
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.setLoading(true);
    return this.http.post<T>(url, body)
      .pipe(
        timeout(this.timeout),
        this.retryWithBackoff<T>(),
        tap(() => this.setLoading(false)),
        catchError(this.handleError)
      );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.setLoading(true);
    return this.http.put<T>(url, body)
      .pipe(
        timeout(this.timeout),
        this.retryWithBackoff<T>(),
        tap(() => this.setLoading(false)),
        catchError(this.handleError)
      );
  }

  delete<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    
    this.setLoading(true);
    return this.http.delete<T>(url, { params: httpParams })
      .pipe(
        timeout(this.timeout),
        this.retryWithBackoff<T>(),
        tap(() => this.setLoading(false)),
        catchError(this.handleError)
      );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.setLoading(true);
    return this.http.patch<T>(url, body)
      .pipe(
        timeout(this.timeout),
        this.retryWithBackoff<T>(),
        tap(() => this.setLoading(false)),
        catchError(this.handleError)
      );
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Clear specific cached request
   */
  clearCachedRequest(method: string, endpoint: string, params?: any): void {
    const cacheKey = `${method.toUpperCase()}:${this.baseUrl}/${endpoint}:${JSON.stringify(params)}`;
    this.requestCache.delete(cacheKey);
  }

  private buildHttpParams(params: any): HttpParams | undefined {
    if (!params) return undefined;
    
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    
    return httpParams;
  }

  private retryWithBackoff<T>() {
    return retry<T>({
      count: this.retryAttempts,
      delay: (error, retryCount) => {
        const delay = Math.pow(2, retryCount - 1) * 1000;
        
        if (this.environmentService.isLoggingEnabled) {
          console.log(`Retry attempt ${retryCount}/${this.retryAttempts} after ${delay}ms`);
        }
        
        return timer(delay);
      }
    });
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    this.setLoading(false);
    
    const apiError: IApiErrorResponse = {
      error: {
        code: error.status || 500,
        timestamp: new Date().toISOString(),
        path: error.url || '',
        method: 'GET', // This should be dynamic based on the actual method
        message: this.getErrorMessage(error)
      }
    };
    
    if (this.environmentService.isLoggingEnabled) {
      console.error('API Error:', apiError);
    }
    
    // You can add global error handling here
    // - Show toast notifications
    // - Redirect to error page
    // - Send to error reporting service
    
    return throwError(() => apiError);
  };

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    
    switch (error.status) {
      case 400: return 'Bad Request - Invalid data provided';
      case 401: return 'Unauthorized - Please login again';
      case 403: return 'Forbidden - You don\'t have permission';
      case 404: return 'Not Found - Resource not available';
      case 409: return 'Conflict - Resource already exists';
      case 422: return 'Validation Error - Please check your data';
      case 429: return 'Too Many Requests - Please try again later';
      case 500: return 'Server Error - Please try again later';
      case 502: return 'Bad Gateway - Service temporarily unavailable';
      case 503: return 'Service Unavailable - Please try again later';
      case 504: return 'Gateway Timeout - Request timed out';
      default: return 'An unexpected error occurred';
    }
  }
}
