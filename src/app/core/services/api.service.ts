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
import { APP_CONFIG } from '@core/config';

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
    const finalBody = this.cleanParams(body);

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
    const finalBody = this.cleanParams(body);

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
    const finalBody = this.cleanParams(body);

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
    const cleanedBody = this.cleanParams(body);

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
        map(res => schema.response.parse(res)),
        catchError(err => this.handleHttpError(err))
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
        sub.next(APP_CONFIG.API_CONFIG.retryDelay);
        sub.complete();
      }, APP_CONFIG.API_CONFIG.retryDelay);
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
