import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, OperatorFunction } from 'rxjs';
import { retry, timeout, map, tap, catchError, delay } from 'rxjs/operators';
import { EnvironmentService } from '@core/services/environment.service';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@shared/services';
import { z } from 'zod';
import { AppConfigService } from '@core/services/app-config.service';

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

  get<T>(endpoint: string, params?: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const httpParams = this.buildHttpParams(params);

    this.logger.logApiRequest('GET', url, params);

    return this.http.get<T>(url, { params: httpParams }).pipe(
      timeout(this.timeout),
      delay(5000),
      tap(response => this.logger.logApiResponse('GET', url, response)),
      this.createRetryConfig<T>('GET', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const processedBody = this.convertEmptyToNull(body);

    this.logger.logApiRequest('POST', url, processedBody);

    return this.http.post<T>(url, processedBody).pipe(
      timeout(this.timeout),
      tap(response => this.logger.logApiResponse('POST', url, response)),
      this.createRetryConfig<T>('POST', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const processedBody = this.convertEmptyToNull(body);

    this.logger.logApiRequest('PUT', url, processedBody);

    return this.http.put<T>(url, processedBody).pipe(
      timeout(this.timeout),
      tap(response => this.logger.logApiResponse('PUT', url, response)),
      this.createRetryConfig<T>('PUT', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  delete<T>(endpoint: string, body?: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    this.logger.logApiRequest('DELETE', url, body);

    return this.http.delete<T>(url, { body }).pipe(
      timeout(this.timeout),
      tap(response => this.logger.logApiResponse('DELETE', url, response)),
      this.createRetryConfig<T>('DELETE', url),
      catchError((error: HttpErrorResponse) => {
        this.showFinalErrorNotification(error);
        return throwError(() => error);
      })
    );
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const processedBody = this.convertEmptyToNull(body);

    this.logger.logApiRequest('PATCH', url, processedBody);

    return this.http.patch<T>(url, processedBody).pipe(
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
    responseSchema: z.ZodSchema<TResponse>,
    options: { multipart?: boolean } = { multipart: false }
  ): Observable<TResponse> {
    try {
      const validatedBody = this.validateRequest(body, requestSchema);
      const processedBody = this.convertEmptyToNull(validatedBody);
      const finalBody = options?.multipart
        ? this.buildFormData(processedBody)
        : processedBody;

      // Use http.post directly to avoid double processing
      const url = `${this.baseUrl}/${endpoint}`;
      this.logger.logApiRequest('POST', url, finalBody);

      return this.http.post<unknown>(url, finalBody).pipe(
        timeout(this.timeout),
        tap(response => this.logger.logApiResponse('POST', url, response)),
        this.createRetryConfig<unknown>('POST', url),
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        ),
        catchError((error: HttpErrorResponse) => {
          this.showFinalErrorNotification(error);
          return throwError(() => error);
        })
      );
    } catch (zodError) {
      return throwError(() => zodError);
    }
  }

  getValidated<TRequest, TResponse>(
    endpoint: string,
    responseSchema: z.ZodSchema<TResponse>,
    params?: unknown,
    requestSchema?: z.ZodSchema<TRequest>
  ): Observable<TResponse> {
    try {
      let validatedParams: unknown;
      if (requestSchema && params) {
        validatedParams = this.validateRequest(
          params as TRequest,
          requestSchema
        );
      }

      return this.get<unknown>(endpoint, validatedParams).pipe(
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        )
      );
    } catch (zodError) {
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
      const processedBody = this.convertEmptyToNull(validatedBody);

      // Use http.put directly to avoid double processing
      const url = `${this.baseUrl}/${endpoint}`;
      this.logger.logApiRequest('PUT', url, processedBody);

      return this.http.put<unknown>(url, processedBody).pipe(
        timeout(this.timeout),
        tap(response => this.logger.logApiResponse('PUT', url, response)),
        this.createRetryConfig<unknown>('PUT', url),
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        ),
        catchError((error: HttpErrorResponse) => {
          this.showFinalErrorNotification(error);
          return throwError(() => error);
        })
      );
    } catch (zodError) {
      return throwError(() => zodError);
    }
  }

  patchValidated<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    requestSchema: z.ZodSchema<TRequest>,
    responseSchema: z.ZodSchema<TResponse>,
    options: { multipart?: boolean } = { multipart: false }
  ): Observable<TResponse> {
    try {
      const validatedBody = this.validateRequest(body, requestSchema);
      const processedBody = this.convertEmptyToNull(validatedBody);
      const finalBody = options?.multipart
        ? this.buildFormData(processedBody)
        : processedBody;

      // Use http.patch directly to avoid double processing
      const url = `${this.baseUrl}/${endpoint}`;
      this.logger.logApiRequest('PATCH', url, finalBody);

      return this.http.patch<unknown>(url, finalBody).pipe(
        timeout(this.timeout),
        tap(response => this.logger.logApiResponse('PATCH', url, response)),
        this.createRetryConfig<unknown>('PATCH', url),
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        ),
        catchError((error: HttpErrorResponse) => {
          this.showFinalErrorNotification(error);
          return throwError(() => error);
        })
      );
    } catch (zodError) {
      return throwError(() => zodError);
    }
  }

  deleteValidated<TRequest, TResponse>(
    endpoint: string,
    responseSchema: z.ZodSchema<TResponse>,
    body?: TRequest,
    requestSchema?: z.ZodSchema<TRequest>
  ): Observable<TResponse> {
    try {
      let validatedBody: unknown;
      if (requestSchema && body) {
        validatedBody = this.validateRequest(body as TRequest, requestSchema);
      }
      return this.delete<unknown>(endpoint, validatedBody).pipe(
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        )
      );
    } catch (zodError) {
      return throwError(() => zodError);
    }
  }

  private buildHttpParams(params?: unknown): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Handle array values by adding multiple parameters with the same key
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item !== null && item !== undefined) {
              httpParams = httpParams.append(key, String(item));
            }
          });
        } else {
          httpParams = httpParams.set(key, String(value));
        }
      }
    });

    return httpParams;
  }

  private convertEmptyToNull<T>(data: T): T {
    if (data === null || data === undefined) {
      return data;
    }

    // Don't process FormData, File, or Blob objects
    if (
      data instanceof FormData ||
      data instanceof File ||
      data instanceof Blob
    ) {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.convertEmptyToNull(item)) as T;
    }

    // Handle objects
    if (typeof data === 'object') {
      const result: Record<string, unknown> = {};

      Object.entries(data).forEach(([key, value]) => {
        // Convert empty strings to null
        if (value === '') {
          result[key] = null;
        }
        // Recursively process nested objects/arrays
        else if (value !== null && typeof value === 'object') {
          result[key] = this.convertEmptyToNull(value);
        }
        // Keep other values as is
        else {
          result[key] = value;
        }
      });

      return result as T;
    }

    // Return primitive values as is
    return data;
  }

  private buildFormData(body: unknown): FormData {
    const formData = new FormData();

    if (!body || typeof body !== 'object') {
      return formData;
    }

    this.appendToFormData(formData, body as Record<string, unknown>);

    return formData;
  }

  private appendToFormData(
    formData: FormData,
    data: Record<string, unknown>,
    parentKey = ''
  ): void {
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      // If value is an array, append each item with the same key (original behavior for arrays)
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item === null || item === undefined) {
            return;
          }

          if (item instanceof File) {
            formData.append(formKey, item);
          } else {
            formData.append(formKey, String(item));
          }
        });
        return;
      }

      // If value is a File, append it directly.
      if (value instanceof File) {
        formData.append(formKey, value);
        return;
      }

      // If value is an object (nested object), recursively append its properties.
      if (typeof value === 'object' && !(value instanceof File)) {
        this.appendToFormData(
          formData,
          value as Record<string, unknown>,
          formKey
        );
        return;
      }

      // Fallback: append primitive values as strings.
      formData.append(formKey, String(value));
    });
  }

  private createRetryConfig<T>(
    method: string,
    url: string
  ): OperatorFunction<T, T> {
    return retry<T>({
      count: this.retryAttempts,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (
          error.status === undefined ||
          error.status === 0 ||
          error.status >= 500
        ) {
          this.logger.info(
            `Retrying attempt ${retryCount}/${this.retryAttempts} - ${method} request to ${url} due to ${error.status ?? 'network'} error`
          );
          return this.calculateRetryDelay();
        }
        throw error;
      },
    });
  }

  private calculateRetryDelay(): Observable<number> {
    const retryDelay = this.appConfigService.apiRetryDelay;
    return new Observable(subscriber => {
      setTimeout(() => {
        subscriber.next(retryDelay);
        subscriber.complete();
      }, retryDelay);
    });
  }

  private showFinalErrorNotification(error: HttpErrorResponse): void {
    let errorMessage = 'Request failed after all retry attempts';

    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    this.notificationService.error(errorMessage);
  }

  private validateRequest<T>(data: T, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (zodError) {
      this.logger.error('Request validation failed');
      const errorMessage = this.formatZodError(zodError as z.ZodError);
      this.notificationService.error(
        `Request validation failed: ${errorMessage}`
      );
      throw zodError;
    }
  }

  private validateResponse<T>(response: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(response);
    } catch (zodError) {
      this.logger.error('Response validation failed');
      const errorMessage = this.formatZodError(zodError as z.ZodError);
      this.notificationService.error(
        `Response validation failed: ${errorMessage}`
      );
      throw zodError;
    }
  }

  private formatZodError(zodError: z.ZodError): string {
    if (zodError?.issues && Array.isArray(zodError.issues)) {
      return zodError.issues
        .map((issue: z.ZodIssue) => {
          const path =
            issue.path?.length > 0 ? `${issue.path.join('.')}` : 'field';
          return `${path}: ${issue.message}`;
        })
        .join(', ');
    }
    return zodError?.message ?? 'Validation failed';
  }
}
