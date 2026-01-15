import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, OperatorFunction } from 'rxjs';
import { retry, timeout, map, tap, catchError } from 'rxjs/operators';
import { z } from 'zod';
import { EnvironmentService } from '@core/services/environment.service';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@shared/services';
import { AppConfigService } from '@core/services/app-config.service';

export interface ApiSchema<TRequest, TResponse> {
  request?: z.ZodType<TRequest>;
  response: z.ZodSchema<TResponse>;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  private readonly appConfigService = inject(AppConfigService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  private get baseUrl(): string {
    return this.environmentService.apiBaseUrl;
  }

  private get timeout(): number {
    return this.appConfigService.apiTimeout;
  }

  private get retryAttempts(): number {
    return this.appConfigService.apiRetryAttempts;
  }

  // =====================================================
  // BASIC HTTP (no validation / transform)
  // =====================================================

  get<T>(endpoint: string, params?: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);

    this.logger.logApiRequest('GET', url, params);

    return this.http.get<T>(url, { params: httpParams }).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('GET', url, res)),
      this.createRetryConfig<T>('GET', url),
      catchError(err => this.handleHttpError(err))
    );
  }

  getBlob(endpoint: string, params?: unknown): Observable<Blob> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);

    this.logger.logApiRequest('GET BLOB', url, params);

    return this.http
      .get(url, {
        params: httpParams,
        responseType: 'blob',
      })
      .pipe(
        timeout(this.timeout),
        tap(() => this.logger.logApiResponse('GET BLOB', url, 'Blob received')),
        this.createRetryConfig<Blob>('GET', url),
        catchError(err => this.handleHttpError(err))
      );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const processed = this.convertEmptyToNull(body);
    const finalBody = this.cleanParams(processed);

    this.logger.logApiRequest('POST', url, finalBody);

    return this.http.post<T>(url, finalBody).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('POST', url, res)),
      this.createRetryConfig<T>('POST', url),
      catchError(err => this.handleHttpError(err))
    );
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const processed = this.convertEmptyToNull(body);
    const finalBody = this.cleanParams(processed);

    this.logger.logApiRequest('PUT', url, finalBody);

    return this.http.put<T>(url, finalBody).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('PUT', url, res)),
      this.createRetryConfig<T>('PUT', url),
      catchError(err => this.handleHttpError(err))
    );
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const processed = this.convertEmptyToNull(body);
    const finalBody = this.cleanParams(processed);

    this.logger.logApiRequest('PATCH', url, finalBody);

    return this.http.patch<T>(url, finalBody).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('PATCH', url, res)),
      this.createRetryConfig<T>('PATCH', url),
      catchError(err => this.handleHttpError(err))
    );
  }

  delete<T>(endpoint: string, body?: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const cleanedBody = body
      ? this.cleanParams(this.convertEmptyToNull(body))
      : body;

    this.logger.logApiRequest('DELETE', url, cleanedBody);

    return this.http.delete<T>(url, { body: cleanedBody }).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('DELETE', url, res)),
      this.createRetryConfig<T>('DELETE', url),
      catchError(err => this.handleHttpError(err))
    );
  }

  // =====================================================
  // VALIDATED / TRANSFORMED METHODS
  // =====================================================

  postValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input: TInput,
    options: { multipart?: boolean } = {}
  ): Observable<TResponse> {
    try {
      const payload = schema.request ? schema.request.parse(input) : input;

      const body = this.resolveRequestBody(payload, options);
      const url = `${this.baseUrl}/${endpoint}`;

      this.logger.logApiRequest('POST', url, body);

      return this.http.post<unknown>(url, body).pipe(
        timeout(this.timeout),
        tap(res => this.logger.logApiResponse('POST', url, res)),
        this.createRetryConfig<unknown>('POST', url),
        map(res => schema.response.parse(res)),
        catchError(err => this.handleHttpError(err))
      );
    } catch (err) {
      return this.handleZodError(err);
    }
  }

  putValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input: TInput,
    options: { multipart?: boolean } = {}
  ): Observable<TResponse> {
    try {
      const payload = schema.request ? schema.request.parse(input) : input;

      const body = this.resolveRequestBody(payload, options);
      const url = `${this.baseUrl}/${endpoint}`;

      this.logger.logApiRequest('PUT', url, body);

      return this.http.put<unknown>(url, body).pipe(
        timeout(this.timeout),
        tap(res => this.logger.logApiResponse('PUT', url, res)),
        this.createRetryConfig<unknown>('PUT', url),
        map(res => schema.response.parse(res)),
        catchError(err => this.handleHttpError(err))
      );
    } catch (err) {
      return this.handleZodError(err);
    }
  }

  patchValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input: TInput,
    options: { multipart?: boolean } = {}
  ): Observable<TResponse> {
    try {
      const payload = schema.request ? schema.request.parse(input) : input;

      const body = this.resolveRequestBody(payload, options);
      const url = `${this.baseUrl}/${endpoint}`;

      this.logger.logApiRequest('PATCH', url, body);

      return this.http.patch<unknown>(url, body).pipe(
        timeout(this.timeout),
        tap(res => this.logger.logApiResponse('PATCH', url, res)),
        this.createRetryConfig<unknown>('PATCH', url),
        map(res => schema.response.parse(res)),
        catchError(err => this.handleHttpError(err))
      );
    } catch (err) {
      return this.handleZodError(err);
    }
  }

  getValidated<TInput, TParams, TResponse>(
    endpoint: string,
    schema: ApiSchema<TParams, TResponse>,
    input?: TInput
  ): Observable<TResponse> {
    try {
      const params =
        input && schema.request ? schema.request.parse(input) : input;

      return this.get<unknown>(endpoint, params).pipe(
        map(res => schema.response.parse(res))
      );
    } catch (err) {
      return this.handleZodError(err);
    }
  }

  deleteValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input?: TInput
  ): Observable<TResponse> {
    try {
      const body =
        input && schema.request ? schema.request.parse(input) : input;

      return this.delete<unknown>(endpoint, body).pipe(
        map(res => schema.response.parse(res)),
        catchError(err => this.handleHttpError(err))
      );
    } catch (err) {
      return this.handleZodError(err);
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private resolveRequestBody(
    body: unknown,
    options?: { multipart?: boolean }
  ): unknown {
    const processed = this.convertEmptyToNull(body);
    const cleaned = this.cleanParams(processed);
    return options?.multipart ? this.buildFormData(cleaned) : cleaned;
  }

  private buildHttpParams(params?: unknown): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    const cleanedParams = this.cleanParams(params);

    if (!cleanedParams || Object.keys(cleanedParams).length === 0) {
      return undefined;
    }

    let httpParams = new HttpParams();
    Object.entries(cleanedParams).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        // Filter out null/undefined/empty strings from arrays
        const filteredArray = value.filter(
          v => v !== null && v !== undefined && v !== ''
        );
        if (filteredArray.length > 0) {
          filteredArray.forEach(v => {
            if (v !== null && v !== undefined && v !== '') {
              httpParams = httpParams.append(key, String(v));
            }
          });
        }
      } else {
        // Skip empty strings
        if (value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    });
    return httpParams;
  }

  private cleanParams<T>(data: T): T {
    // Check for both null and undefined
    if (data === null || data === undefined) {
      return {} as T;
    }

    if (Array.isArray(data)) {
      const filtered = data
        .filter(item => item !== null && item !== undefined && item !== '')
        .map(item => this.cleanParams(item));
      return filtered as T;
    }

    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        // Skip null, undefined, and empty strings
        if (value !== null && value !== undefined && value !== '') {
          const cleanedValue = this.cleanParams(value);
          // Only add if cleaned value is not empty
          if (
            cleanedValue !== null &&
            cleanedValue !== undefined &&
            cleanedValue !== '' &&
            !(
              typeof cleanedValue === 'object' &&
              !Array.isArray(cleanedValue) &&
              Object.keys(cleanedValue).length === 0
            ) &&
            !(Array.isArray(cleanedValue) && cleanedValue.length === 0)
          ) {
            result[key] = cleanedValue;
          }
        }
      });
      return result as T;
    }

    return data;
  }

  private convertEmptyToNull<T>(data: T): T {
    if (
      data === null ||
      data === undefined ||
      data instanceof FormData ||
      data instanceof File ||
      data instanceof Blob
    ) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(v => this.convertEmptyToNull(v)) as T;
    }

    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};
      Object.entries(data).forEach(([k, v]) => {
        result[k] = v === '' ? null : this.convertEmptyToNull(v);
      });
      return result as T;
    }

    return data;
  }

  private buildFormData(body: unknown): FormData {
    const formData = new FormData();
    if (!body || typeof body !== 'object') {
      return formData;
    }

    Object.entries(body).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    return formData;
  }

  private createRetryConfig<T>(
    method: string,
    url: string
  ): OperatorFunction<T, T> {
    return retry<T>({
      count: this.retryAttempts,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (!error.status || error.status >= 500) {
          this.logger.info(
            `Retry ${retryCount}/${this.retryAttempts} - ${method} ${url}`
          );
          return this.calculateRetryDelay();
        }
        throw error;
      },
    });
  }

  private calculateRetryDelay(): Observable<number> {
    return new Observable(sub => {
      setTimeout(() => {
        sub.next(this.appConfigService.apiRetryDelay);
        sub.complete();
      }, this.appConfigService.apiRetryDelay);
    });
  }

  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    this.notificationService.error(
      error.status === 0
        ? 'Network error'
        : (error.error?.error?.message ?? 'Unexpected error')
    );
    return throwError(() => error);
  }

  private handleZodError(error: unknown): Observable<never> {
    if (error instanceof z.ZodError) {
      const message = error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join(', ');
      this.notificationService.error(`Validation failed: ${message}`);
    }
    return throwError(() => error);
  }
}
