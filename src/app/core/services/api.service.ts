import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, OperatorFunction } from 'rxjs';
import { retry, timeout, map, tap, catchError } from 'rxjs/operators';
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

  put<T>(endpoint: string, body: unknown): Observable<T> {
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
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        )
      );
    } catch (zodError) {
      return throwError(() => zodError);
    }
  }

  getValidated<TResponse>(
    endpoint: string,
    responseSchema: z.ZodSchema<TResponse>,
    params?: unknown
  ): Observable<TResponse> {
    try {
      return this.get<unknown>(endpoint, params).pipe(
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
      return this.put<unknown>(endpoint, validatedBody).pipe(
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        )
      );
    } catch (zodError) {
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
        map((response: unknown) =>
          this.validateResponse(response, responseSchema)
        )
      );
    } catch (zodError) {
      return throwError(() => zodError);
    }
  }

  deleteValidated<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    requestSchema: z.ZodSchema<TRequest>,
    responseSchema: z.ZodSchema<TResponse>
  ): Observable<TResponse> {
    try {
      const validatedBody = this.validateRequest(body, requestSchema);
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
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
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
    const delay = this.appConfigService.apiRetryDelay;
    return new Observable(subscriber => {
      setTimeout(() => {
        subscriber.next(delay);
        subscriber.complete();
      }, delay);
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
