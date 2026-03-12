import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService, EnvironmentService } from '@core/services';
import { ELogTypes } from '@core/types';

@Injectable()
export class LoggingErrorHandler extends ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly env = inject(EnvironmentService);

  override handleError(error: unknown): void {
    if (!this.env.shouldLogLevel('error')) {
      super.handleError(error);
      return;
    }

    const err = error as Error & { rejection?: unknown };
    const message = err?.message ?? String(error);
    const stack = err?.stack?.split('\n') ?? [];

    this.logger.addStructuredLog(ELogTypes.ERROR, 'error', message, {
      data: {
        message: err?.message,
        name: err?.name,
        rejection: err?.rejection,
        fullError: error,
      },
      callStack: stack.slice(0, 10),
    });

    super.handleError(error);
  }
}
