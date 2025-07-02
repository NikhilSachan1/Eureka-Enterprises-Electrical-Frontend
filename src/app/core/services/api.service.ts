import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, share, map, tap, catchError } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { LoggerService } from './logger.service';
import { NotificationService } from '../../shared/services/notification.service';
import { z } from 'zod';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  
  // Request deduplication cache
  private readonly requestCache = new Map<string, Observable<any>>();

  private get baseUrl(): string {
    return this.environmentService.apiBaseUrl;
  }

  private get timeout(): number {
    return this.appConfigService.apiTimeout;
  }

  private get retryAttempts(): number {
    return this.appConfigService.apiRetryAttempts;
  }

  get<T>(endpoint: string, params?: any, useCache = false): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    const cacheKey = useCache ? `GET:${url}:${JSON.stringify(params)}` : null;
    
    if (useCache && cacheKey && this.requestCache.has(cacheKey)) {
      this.logger.debug('Cache hit', { method: 'GET', url, cacheKey });
      return this.requestCache.get(cacheKey)!;
    }
    
    this.logger.logApiRequest('GET', url, params);
    
    const request$ = this.http.get<T>(url, { params: httpParams })
      .pipe(
        timeout(this.timeout),
        tap(response => this.logger.logApiResponse('GET', url, response)),
        this.createRetryConfig<T>('GET', url),
        catchError((error: HttpErrorResponse) => {
          this.showFinalErrorNotification(error);
          return throwError(() => error);
        }),
        share()
      );
    
    if (useCache && cacheKey) {
      this.requestCache.set(cacheKey, request$);
      setTimeout(() => this.requestCache.delete(cacheKey), this.appConfigService.cacheDefaultDuration);
    }
    
    return request$;
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.logger.logApiRequest('POST', url, body);
    
    return this.http.post<T>(url, body).pipe(
      timeout(this.timeout),
      tap(response => this.logger.logApiResponse('POST', url, response)),
      this.createRetryConfig<T>('POST', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.logger.logApiRequest('PUT', url, body);
    
    return this.http.put<T>(url, body).pipe(
      timeout(this.timeout),
      tap(response => this.logger.logApiResponse('PUT', url, response)),
      this.createRetryConfig<T>('PUT', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  delete<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    
    this.logger.logApiRequest('DELETE', url, params);
    
    return this.http.delete<T>(url, { params: httpParams }).pipe(
      timeout(this.timeout),
      tap(response => this.logger.logApiResponse('DELETE', url, response)),
      this.createRetryConfig<T>('DELETE', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    this.logger.logApiRequest('PATCH', url, body);
    
    return this.http.patch<T>(url, body).pipe(
      timeout(this.timeout),
      tap(response => this.logger.logApiResponse('PATCH', url, response)),
      this.createRetryConfig<T>('PATCH', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  // Validated API methods
  postValidated<TRequest, TResponse>(
    endpoint: string, 
    body: TRequest,
    requestSchema: z.ZodSchema<TRequest>,
    responseSchema: z.ZodSchema<TResponse>
  ): Observable<TResponse> {
    try {
      const validatedBody = this.validateRequest(body, requestSchema);
      return this.post<unknown>(endpoint, validatedBody).pipe(
        map((response: unknown) => this.validateResponse(response, responseSchema))
      );
    } catch (zodError: any) {
      return throwError(() => zodError);
    }
  }

  getValidated<TResponse>(
    endpoint: string,
    responseSchema: z.ZodSchema<TResponse>,
    params?: any,
    useCache = false
  ): Observable<TResponse> {
    try {
      return this.get<unknown>(endpoint, params, useCache).pipe(
        map((response: unknown) => this.validateResponse(response, responseSchema))
      );
    } catch (zodError: any) {
      return throwError(() => zodError);
    }
  }

  putValidated<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    requestSchema: z.ZodSchema<TRequest>,
    responseSchema: z.ZodSchema<TResponse>
  ): Observable<TResponse> {
    try {
      const validatedBody = this.validateRequest(body, requestSchema);
      return this.put<unknown>(endpoint, validatedBody).pipe(
        map((response: unknown) => this.validateResponse(response, responseSchema))
      );
    } catch (zodError: any) {
      return throwError(() => zodError);
    }
  }

  patchValidated<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    requestSchema: z.ZodSchema<TRequest>,
    responseSchema: z.ZodSchema<TResponse>
  ): Observable<TResponse> {
    try {
      const validatedBody = this.validateRequest(body, requestSchema);
      return this.patch<unknown>(endpoint, validatedBody).pipe(
        map((response: unknown) => this.validateResponse(response, responseSchema))
      );
    } catch (zodError: any) {
      return throwError(() => zodError);
    }
  }

  deleteValidated<TResponse>(
    endpoint: string,
    responseSchema: z.ZodSchema<TResponse>,
    params?: any
  ): Observable<TResponse> {
    try {
      return this.delete<unknown>(endpoint, params).pipe(
        map((response: unknown) => this.validateResponse(response, responseSchema))
      );
    } catch (zodError: any) {
      return throwError(() => zodError);
    }
  }

  // Utility methods
  clearCache(): void {
    this.requestCache.clear();
  }

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

  private createRetryConfig<T>(method: string, url: string) {
    return retry<T>({
      count: this.retryAttempts,
      delay: (error: HttpErrorResponse, retryCount: number) => {        
        if ( error.status === undefined || error.status === 0 || error.status >= 500) {
          this.logger.info(`Retrying attempt ${retryCount}/${this.retryAttempts} - ${method} request to ${url} due to ${error.status || 'network'} error`);
          return this.calculateRetryDelay();
        }
        throw error;
      }
    });
  }

  private calculateRetryDelay(): Observable<number> {
    const delay = this.appConfigService.apiRetryDelay;
    return new Observable(subscriber => {
      setTimeout(() => {
        subscriber.next(delay);
        subscriber.complete();
      }, delay);
    });
  }

  private showFinalErrorNotification(error: HttpErrorResponse): void {
    let errorMessage: string = 'Request failed after all retry attempts';
    
    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.error && error.error.error && error.error.error.message) {
      errorMessage = error.error.error.message;
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    this.notificationService.error(errorMessage);
  }

  private validateRequest<T>(data: T, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (zodError: any) {
      this.logger.error('Request validation failed');
      const errorMessage = this.formatZodError(zodError);
      this.notificationService.error(`Request validation failed: ${errorMessage}`);
      throw zodError;
    }
  }

  private validateResponse<T>(response: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(response);
    } catch (zodError: any) {
      this.logger.error('Response validation failed');
      const errorMessage = this.formatZodError(zodError);
      this.notificationService.error(`Response validation failed: ${errorMessage}`);
      throw zodError;
    }
  }

  private formatZodError(zodError: any): string {
    if (zodError?.issues && Array.isArray(zodError.issues)) {
      return zodError.issues
        .map((issue: any) => {
          const path = issue.path?.length > 0 ? `${issue.path.join('.')}` : 'field';
          return `${path}: ${issue.message}`;
        })
        .join(', ');
    }
    return zodError?.message || 'Validation failed';
  }
}
