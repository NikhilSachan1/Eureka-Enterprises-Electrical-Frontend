import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  EPrimeNGNotificationSeverity,
  ESeverity,
  INotificationOptions,
} from '@shared/types';
import {
  DEFAULT_NOTIFICATION_OPTIONS_CONFIG,
  DEFAULT_NOTIFICATION_MESSAGES,
  DEFAULT_NOTIFICATION_TITLES,
} from '@shared/config';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly messageService = inject(MessageService);

  // General methods for flexibility
  success(
    message: string,
    title: string = DEFAULT_NOTIFICATION_TITLES.success,
    options?: INotificationOptions
  ): void {
    this.showNotification(ESeverity.SUCCESS, message, title, options);
  }

  error(
    message: string,
    title: string = DEFAULT_NOTIFICATION_TITLES.error,
    options?: INotificationOptions
  ): void {
    this.showNotification(ESeverity.ERROR, message, title, options);
  }

  warning(
    message: string,
    title: string = DEFAULT_NOTIFICATION_TITLES.warning,
    options?: INotificationOptions
  ): void {
    this.showNotification(ESeverity.WARNING, message, title, options);
  }

  info(
    message: string,
    title: string = DEFAULT_NOTIFICATION_TITLES.info,
    options?: INotificationOptions
  ): void {
    this.showNotification(ESeverity.INFO, message, title, options);
  }

  validationError(message: string): void {
    this.showNotification(
      ESeverity.ERROR,
      message || DEFAULT_NOTIFICATION_MESSAGES.VALIDATION_FAILED,
      DEFAULT_NOTIFICATION_TITLES.validation
    );
  }

  /**
   * Handles bulk operation API response directly (results array with success flag).
   * Splits results into errors/result and shows appropriate notification.
   */
  bulkOperationFromApiResponse(
    response: { results: { id: string; success: boolean; message?: string }[] },
    entityLabel: string,
    actionLabel: string
  ): void {
    const errors = response.results
      .filter(item => !item.success)
      .map(item => ({ id: item.id, message: item.message }));
    const result = response.results
      .filter(item => item.success)
      .map(item => ({ id: item.id }));
    this.bulkOperationResult({
      entityLabel,
      actionLabel,
      errors,
      result,
    });
  }

  bulkOperationResult<TError = unknown, TResult = unknown>(config: {
    entityLabel: string;
    actionLabel: string;
    errors: TError[];
    result?: TResult[];
    success?: number;
    failed?: number;
  }): void {
    const { entityLabel, actionLabel, errors, result, success, failed } =
      config;

    const errorCount = errors?.length ?? 0;
    const resultCount = result?.length ?? 0;
    const recordsCount = errorCount + resultCount;

    const hasErrors = errorCount > 0;
    const hasResult = resultCount > 0;

    // When both errors and results exist, we need to show a mixed summary.
    if (hasErrors && hasResult) {
      if (recordsCount === 1) {
        // Single record failed.
        this.error(`Failed to ${actionLabel} ${entityLabel}`);
      } else {
        // Some records failed and some succeeded.
        this.error(
          `Failed to ${actionLabel} ${entityLabel} for ${errorCount ?? failed} records and executed successfully for ${resultCount ?? success} records`
        );
      }
      return;
    }

    // When only errors exist, we show a pure failure summary.
    if (hasErrors) {
      if (recordsCount === 1) {
        // Single record failed.
        this.error(`Failed to ${actionLabel} ${entityLabel}`);
      } else {
        // Multiple records failed.
        this.error(
          `Failed to ${actionLabel} ${entityLabel} for ${errorCount} records`
        );
      }
      return;
    }

    // When only results exist, we show a success summary.
    if (hasResult) {
      if (recordsCount === 1) {
        // Single record succeeded.
        this.success(`Successfully ${actionLabel} ${entityLabel}`);
      } else {
        // Multiple records succeeded.
        this.success(
          `Successfully ${actionLabel} ${entityLabel} for ${resultCount} records`
        );
      }
    }
  }

  private showNotification(
    severity: EPrimeNGNotificationSeverity,
    message: string,
    title: string,
    options?: INotificationOptions
  ): void {
    const finalOptions = {
      ...DEFAULT_NOTIFICATION_OPTIONS_CONFIG,
      ...options,
    };

    this.messageService.add({
      severity,
      summary: title,
      detail: message,
      life: finalOptions.life,
      sticky: finalOptions.sticky,
      closable: finalOptions.closable,
    });
  }
}
