import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MonoTypeOperatorFunction, Observable, throwError, timer } from 'rxjs';
import { retry, timeout, map, tap, catchError } from 'rxjs/operators';
import { z } from 'zod';
import { EnvironmentService } from '@core/services/environment.service';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@shared/services';
import { format24hClockTimesInTextTo12h } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { GET_ENDPOINT_PATHS_WITHOUT_ERROR_TOAST } from '@core/constants';

export interface ApiSchema<TRequest, TResponse> {
  request?: z.ZodType<TRequest>;
  response: z.ZodSchema<TResponse>;
}

/** Optional flags for API calls. */
export interface ApiRequestOptions {
  /**
   * Override auto toast suppression for GETs listed in {@link GET_ENDPOINT_PATHS_WITHOUT_ERROR_TOAST}.
   * - `true`: never toast
   * - `false`: always toast on error
   * - omit: default — silent for those GET endpoints only
   */
  silent?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  private get baseUrl(): string {
    return this.environmentService.apiBaseUrl;
  }

  private get timeout(): number {
    return APP_CONFIG.API_CONFIG.timeout;
  }

  private get retryAttempts(): number {
    return APP_CONFIG.API_CONFIG.retryAttempts;
  }

  // =====================================================
  // BASIC HTTP (no validation / transform)
  // =====================================================

  get<T>(
    endpoint: string,
    params?: unknown,
    options?: ApiRequestOptions
  ): Observable<T> {
    const silent = this.resolveSilentForGet(endpoint, options);
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);

    this.logger.logApiRequest('GET', url, params);

    return this.http.get<T>(url, { params: httpParams }).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('GET', url, res)),
      this.createRetryConfig<T>('GET', url),
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  getBlob(
    endpoint: string,
    params?: unknown,
    options?: ApiRequestOptions
  ): Observable<Blob> {
    const silent = this.resolveSilentForGet(endpoint, options);
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
        catchError(err => this.handleHttpError(err, silent))
      );
  }

  post<T>(
    endpoint: string,
    body: unknown,
    options?: ApiRequestOptions
  ): Observable<T> {
    const silent = options?.silent ?? false;
    const url = `${this.baseUrl}/${endpoint}`;
    const finalBody = this.cleanParams(body);

    this.logger.logApiRequest('POST', url, finalBody);

    return this.http.post<T>(url, finalBody).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('POST', url, res)),
      this.createRetryConfig<T>('POST', url),
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  put<T>(
    endpoint: string,
    body: unknown,
    options?: ApiRequestOptions
  ): Observable<T> {
    const silent = options?.silent ?? false;
    const url = `${this.baseUrl}/${endpoint}`;
    const finalBody = this.cleanParams(body);

    this.logger.logApiRequest('PUT', url, finalBody);

    return this.http.put<T>(url, finalBody).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('PUT', url, res)),
      this.createRetryConfig<T>('PUT', url),
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  patch<T>(
    endpoint: string,
    body: unknown,
    options?: ApiRequestOptions
  ): Observable<T> {
    const silent = options?.silent ?? false;
    const url = `${this.baseUrl}/${endpoint}`;
    const finalBody = this.cleanParams(body);

    this.logger.logApiRequest('PATCH', url, finalBody);

    return this.http.patch<T>(url, finalBody).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('PATCH', url, res)),
      this.createRetryConfig<T>('PATCH', url),
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  delete<T>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Observable<T> {
    const silent = options?.silent ?? false;
    const url = `${this.baseUrl}/${endpoint}`;
    const cleanedBody = this.cleanParams(body);

    this.logger.logApiRequest('DELETE', url, cleanedBody);

    return this.http.delete<T>(url, { body: cleanedBody }).pipe(
      timeout(this.timeout),
      tap(res => this.logger.logApiResponse('DELETE', url, res)),
      this.createRetryConfig<T>('DELETE', url),
      catchError(err => this.handleHttpError(err, silent))
    );
  }

  // =====================================================
  // VALIDATED / TRANSFORMED METHODS
  // =====================================================

  postValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input?: TInput,
    options: { multipart?: boolean; silent?: boolean } = {}
  ): Observable<TResponse> {
    const silent = options.silent ?? false;
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
        catchError(err => this.catchValidatedPipelineError(err, silent))
      );
    } catch (err) {
      return this.handleZodError(err, silent);
    }
  }

  putValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input: TInput,
    options: { multipart?: boolean; silent?: boolean } = {}
  ): Observable<TResponse> {
    const silent = options.silent ?? false;
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
        catchError(err => this.catchValidatedPipelineError(err, silent))
      );
    } catch (err) {
      return this.handleZodError(err, silent);
    }
  }

  patchValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input: TInput,
    options: { multipart?: boolean; silent?: boolean } = {}
  ): Observable<TResponse> {
    const silent = options.silent ?? false;
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
        catchError(err => this.catchValidatedPipelineError(err, silent))
      );
    } catch (err) {
      return this.handleZodError(err, silent);
    }
  }

  getValidated<TInput, TParams, TResponse>(
    endpoint: string,
    schema: ApiSchema<TParams, TResponse>,
    input?: TInput,
    options?: ApiRequestOptions
  ): Observable<TResponse> {
    const silent = this.resolveSilentForGet(endpoint, options);
    try {
      const params =
        input && schema.request ? schema.request.parse(input) : input;

      return this.get<unknown>(endpoint, params, { silent }).pipe(
        map(res => schema.response.parse(res)),
        catchError(err => {
          if (err instanceof z.ZodError) {
            return this.handleZodError(err, silent);
          }
          return throwError(() => err);
        })
      );
    } catch (err) {
      return this.handleZodError(err, silent);
    }
  }

  deleteValidated<TInput, TRequest, TResponse>(
    endpoint: string,
    schema: ApiSchema<TRequest, TResponse>,
    input?: TInput,
    options?: ApiRequestOptions
  ): Observable<TResponse> {
    const silent = options?.silent ?? false;
    try {
      const body =
        input && schema.request ? schema.request.parse(input) : input;

      return this.delete<unknown>(endpoint, body, { silent }).pipe(
        map(res => schema.response.parse(res)),
        catchError(err => {
          if (err instanceof z.ZodError) {
            return this.handleZodError(err, silent);
          }
          return throwError(() => err);
        })
      );
    } catch (err) {
      return this.handleZodError(err, silent);
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  private resolveSilentForGet(
    endpoint: string,
    options?: ApiRequestOptions
  ): boolean {
    if (options?.silent === true) {
      return true;
    }
    if (options?.silent === false) {
      return false;
    }
    return GET_ENDPOINT_PATHS_WITHOUT_ERROR_TOAST.has(endpoint);
  }

  private catchValidatedPipelineError(
    err: unknown,
    silent: boolean
  ): Observable<never> {
    if (err instanceof z.ZodError) {
      return this.handleZodError(err, silent);
    }
    return this.handleHttpError(err as HttpErrorResponse, silent);
  }

  private resolveRequestBody(
    body: unknown,
    options?: { multipart?: boolean }
  ): unknown {
    const cleaned = this.cleanParams(body);
    if (options?.multipart) {
      const flattened = this.flattenObject(cleaned);
      return this.buildFormData(flattened);
    }
    return cleaned;
  }

  private buildHttpParams(params?: unknown): HttpParams | undefined {
    if (this.isEmptyValue(params)) {
      return undefined;
    }

    const cleanedParams = this.cleanParams(params);

    if (this.isEmptyValue(cleanedParams)) {
      return undefined;
    }

    let httpParams = new HttpParams();

    Object.entries(cleanedParams as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (!this.isEmptyValue(v)) {
              httpParams = httpParams.append(key, String(v));
            }
          });
        } else if (!this.isEmptyValue(value)) {
          httpParams = httpParams.set(key, String(value));
        }
      }
    );

    return httpParams;
  }

  private cleanParams<T>(data: T): T {
    // 🔹 base case
    if (this.isEmptyValue(data)) {
      return {} as T;
    }

    // 🔹 array case
    if (Array.isArray(data)) {
      return data
        .map(item => this.cleanParams(item))
        .filter(item => !this.isEmptyValue(item)) as T;
    }

    // 🔹 object case
    if (typeof data === 'object' && !this.isFileOrBlob(data)) {
      const result: Record<string, unknown> = {};

      Object.entries(data as Record<string, unknown>).forEach(
        ([key, value]) => {
          const cleanedValue = this.cleanParams(value);

          if (!this.isEmptyValue(cleanedValue)) {
            result[key] = cleanedValue;
          }
        }
      );

      return result as T;
    }

    // 🔹 primitive value
    return data;
  }

  private flattenObject(
    value: unknown,
    parentKey = '',
    result: Record<string, unknown> = {}
  ): Record<string, unknown> {
    if (value === null || value === undefined) {
      return result;
    }

    if (this.isFileOrBlob(value)) {
      if (parentKey) {
        result[parentKey] = value;
      }
      return result;
    }

    if (Array.isArray(value)) {
      const hasFiles = value.some(item => this.isFileOrBlob(item));
      if (hasFiles && parentKey) {
        result[parentKey] = value;
        return result;
      }

      value.forEach((item, index) => {
        const key = parentKey ? `${parentKey}[${index}]` : String(index);
        this.flattenObject(item, key, result);
      });
      return result;
    }

    // 🔹 Object case - nested objects को flatten करें
    if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
        const key = parentKey ? `${parentKey}[${k}]` : k;
        this.flattenObject(v, key, result);
      });
      return result;
    }

    // 🔹 Primitive value
    result[parentKey] = value;
    return result;
  }

  private buildFormData(body: unknown): FormData {
    const formData = new FormData();
    if (!body || typeof body !== 'object') {
      return formData;
    }

    Object.entries(body).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== null && item !== undefined) {
            formData.append(key, item as Blob);
          }
        });
      } else {
        formData.append(key, value as Blob);
      }
    });
    return formData;
  }

  private isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object' && !this.isFileOrBlob(value)) {
      return Object.keys(value).length === 0;
    }

    return false;
  }

  private isFileOrBlob(value: unknown): boolean {
    return value instanceof File || value instanceof Blob;
  }

  private createRetryConfig<T>(
    method: string,
    url: string
  ): MonoTypeOperatorFunction<T> {
    return retry<T>({
      count: this.retryAttempts,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (!error.status || error.status >= 500) {
          this.logger.info(
            `Retry ${retryCount}/${this.retryAttempts} - ${method} ${url}`
          );
          return timer(APP_CONFIG.API_CONFIG.retryDelay);
        }
        throw error;
      },
    });
  }

  private handleHttpError(
    error: HttpErrorResponse,
    silent = false
  ): Observable<never> {
    const raw =
      error.status === 0
        ? 'Network error'
        : (error.error?.error?.message ?? 'Unexpected error');
    const message =
      typeof raw === 'string' ? format24hClockTimesInTextTo12h(raw) : raw;
    if (!silent) {
      this.notificationService.error(message);
    }
    return throwError(() => error);
  }

  private handleZodError(error: unknown, silent = false): Observable<never> {
    if (error instanceof z.ZodError) {
      const message = error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join(', ');
      if (!silent) {
        this.notificationService.error(`Validation failed: ${message}`);
      }
    }
    return throwError(() => error);
  }
}
