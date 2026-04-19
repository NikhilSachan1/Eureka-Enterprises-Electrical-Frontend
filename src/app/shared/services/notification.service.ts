import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  EPrimeNGNotificationSeverity,
  ESeverity,
  IBulkOperationResponseNotificationConfig,
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
   * Maps into {@link bulkOperationFromResponse} shape and shows per-record messages when present.
   */
  bulkOperationFromApiResponse(
    response: { results: { id: string; success: boolean; message?: string }[] },
    entityLabel: string,
    actionLabel: string
  ): void {
    const mapped = {
      result: response.results
        .filter(item => item.success)
        .map(item => ({ message: item.message })),
      errors: response.results
        .filter(item => !item.success)
        .map(item => ({ error: item.message })),
    };
    this.bulkOperationFromResponse(mapped, {
      successItemsPath: 'result',
      errorItemsPath: 'errors',
      successMessageKey: 'message',
      errorMessageKey: 'error',
      fallbacks: {
        success: (count: number) =>
          count === 1
            ? `Successfully ${actionLabel} ${entityLabel}.`
            : `Successfully ${actionLabel} ${entityLabel} for ${count} records.`,
        error: `Failed to ${actionLabel} ${entityLabel}.`,
        empty: `Failed to ${actionLabel} ${entityLabel}.`,
      },
    });
  }

  /**
   * Formats multiple per-record message strings for toast/detail text (success or error).
   * - If every message is the same, returns that single string (no bullets).
   * - Otherwise returns unique messages in first-seen order, each prefixed with `• ` and joined with newlines.
   * - Returns `null` if there is no non-empty message after trim.
   *
   * Use with toast styles that preserve newlines (e.g. `white-space: pre-line` on toast text).
   */
  formatBulkMessages(messages: (string | null | undefined)[]): string | null {
    const normalized = NotificationService.normalizeBulkErrorStrings(messages);
    if (normalized.length === 0) {
      return null;
    }
    if (NotificationService.allBulkMessagesIdentical(normalized)) {
      return normalized[0];
    }
    return NotificationService.uniquePreserveOrder(normalized)
      .map(line => `• ${line}`)
      .join('\n');
  }

  /**
   * Shows a success toast (green) using {@link formatBulkMessages}.
   */
  successWithBulkMessages(
    messages: (string | null | undefined)[],
    fallbackMessage: string,
    title: string = DEFAULT_NOTIFICATION_TITLES.success,
    options?: INotificationOptions
  ): void {
    const detail = this.formatBulkMessages(messages);
    this.success(detail ?? fallbackMessage, title, options);
  }

  /**
   * Shows an error toast (red) using {@link formatBulkMessages}.
   */
  errorWithBulkMessages(
    messages: (string | null | undefined)[],
    fallbackMessage: string,
    title: string = DEFAULT_NOTIFICATION_TITLES.error,
    options?: INotificationOptions
  ): void {
    const detail = this.formatBulkMessages(messages);
    this.error(detail ?? fallbackMessage, title, options);
  }

  /**
   * Shows a warning whose body is `summary` plus, when present, a blank line and the bulk error detail.
   */
  warningWithBulkErrorDetail(
    summary: string,
    errorMessages: (string | null | undefined)[],
    title: string = DEFAULT_NOTIFICATION_TITLES.warning,
    options?: INotificationOptions
  ): void {
    const errorBlock = this.formatBulkMessages(errorMessages);
    const message = errorBlock ? `${summary}\n\n${errorBlock}` : summary;
    this.warning(message, title, options);
  }

  /**
   * Interprets a bulk API `response` using configurable paths and per-item message keys:
   * - Only errors → red toast; messages formatted with bullets unless all identical.
   * - Only success → green toast; same formatting rules.
   * - Both → one warning toast with success and error sections.
   * - Neither → `fallbacks.empty` or a generic info message.
   *
   * When **more than one** row is processed, a shared “Bulk operation completed: …” headline is prepended.
   * For a **single** row, only the message/fallback text is shown (no bulk headline).
   */
  bulkOperationFromResponse(
    response: unknown,
    config: IBulkOperationResponseNotificationConfig,
    options?: INotificationOptions
  ): void {
    const successItems = NotificationService.coerceArray(
      NotificationService.readPath(response, config.successItemsPath)
    );
    const errorItems = NotificationService.coerceArray(
      NotificationService.readPath(response, config.errorItemsPath)
    );

    const successMessages = successItems
      .map(item => this.readItemMessage(item, config.successMessageKey))
      .filter((m): m is string => m !== undefined);
    const errorMessages = errorItems
      .map(item => this.readItemMessage(item, config.errorMessageKey))
      .filter((m): m is string => m !== undefined);

    const nS = successItems.length;
    const nE = errorItems.length;

    if (nE > 0 && nS === 0) {
      const detail =
        this.formatBulkMessages(errorMessages) ??
        this.resolveBulkPathFallback('error', nE, config);
      const body = this.prependBulkHeadlineIfMulti(nS, nE, detail);
      this.error(body, DEFAULT_NOTIFICATION_TITLES.error, options);
      return;
    }

    if (nS > 0 && nE === 0) {
      const detail =
        this.formatBulkMessages(successMessages) ??
        this.resolveBulkPathFallback('success', nS, config);
      const body = this.prependBulkHeadlineIfMulti(nS, nE, detail);
      this.success(body, DEFAULT_NOTIFICATION_TITLES.success, options);
      return;
    }

    if (nS > 0 && nE > 0) {
      const message = this.buildMixedBulkOperationMessage(
        nS,
        nE,
        errorMessages,
        config
      );
      this.warning(message, DEFAULT_NOTIFICATION_TITLES.warning, options);
      return;
    }

    const empty =
      config.fallbacks?.empty ??
      DEFAULT_NOTIFICATION_MESSAGES.SOMETHING_WENT_WRONG;
    this.info(empty, DEFAULT_NOTIFICATION_TITLES.info, options);
  }

  /**
   * Mixed bulk: headline with counts, then failure reason(s) — one line if all errors
   * share the same message; otherwise • bullets (unique, first-seen order).
   * Mixed always implies at least two rows, so the bulk headline is always included.
   */
  private buildMixedBulkOperationMessage(
    successCount: number,
    errorCount: number,
    errorMessages: (string | null | undefined)[],
    config: IBulkOperationResponseNotificationConfig
  ): string {
    const total = successCount + errorCount;
    const headline = DEFAULT_NOTIFICATION_MESSAGES.bulkMixedHeadline(
      total,
      successCount,
      errorCount
    );

    const reasonsText =
      this.formatBulkMessages(errorMessages) ??
      this.resolveBulkPathFallback('error', errorCount, config);

    const normalized =
      NotificationService.normalizeBulkErrorStrings(errorMessages);
    const reasonLabel = this.mixedFailureReasonLabel(normalized);

    return [headline, '', reasonLabel, reasonsText].join('\n');
  }

  /**
   * Prepends the bulk-operation headline when more than one record was processed.
   * Single-record flows show only `detail`.
   */
  private prependBulkHeadlineIfMulti(
    successCount: number,
    errorCount: number,
    detail: string
  ): string {
    if (successCount + errorCount <= 1) {
      return detail;
    }
    const total = successCount + errorCount;
    const headline = DEFAULT_NOTIFICATION_MESSAGES.bulkMixedHeadline(
      total,
      successCount,
      errorCount
    );
    return `${headline}\n\n${detail}`;
  }

  /** Label before the failure text in a mixed-result warning. */
  private mixedFailureReasonLabel(normalizedMessages: string[]): string {
    if (normalizedMessages.length === 0) {
      return 'Details:';
    }
    if (NotificationService.allBulkMessagesIdentical(normalizedMessages)) {
      return 'Reason:';
    }
    return 'Reasons:';
  }

  private readItemMessage(item: unknown, keyPath: string): string | undefined {
    const value = NotificationService.readPath(item, keyPath);
    if (value === null) {
      return undefined;
    }
    const s = String(value).trim();
    return s.length > 0 ? s : undefined;
  }

  private resolveBulkPathFallback(
    kind: 'success' | 'error',
    count: number,
    config: IBulkOperationResponseNotificationConfig
  ): string {
    const raw =
      kind === 'success' ? config.fallbacks?.success : config.fallbacks?.error;
    if (typeof raw === 'function') {
      return raw(count);
    }
    if (typeof raw === 'string') {
      return raw;
    }
    return kind === 'success'
      ? `${count} record(s) completed successfully.`
      : `${count} record(s) failed.`;
  }

  private static readPath(root: unknown, path: string): unknown {
    if (root === null || path === '') {
      return undefined;
    }
    const parts = path.split('.').filter(Boolean);
    let cur: unknown = root;
    for (const p of parts) {
      if (cur === null || typeof cur !== 'object') {
        return undefined;
      }
      cur = (cur as Record<string, unknown>)[p];
    }
    return cur;
  }

  private static coerceArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private static normalizeBulkErrorStrings(
    messages: (string | null | undefined)[]
  ): string[] {
    return messages
      .map(m => (m ?? '').trim())
      .filter((m): m is string => m.length > 0);
  }

  private static allBulkMessagesIdentical(messages: string[]): boolean {
    if (messages.length <= 1) {
      return true;
    }
    const first = messages[0];
    return messages.every(m => m === first);
  }

  private static uniquePreserveOrder(messages: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const m of messages) {
      if (!seen.has(m)) {
        seen.add(m);
        out.push(m);
      }
    }
    return out;
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
