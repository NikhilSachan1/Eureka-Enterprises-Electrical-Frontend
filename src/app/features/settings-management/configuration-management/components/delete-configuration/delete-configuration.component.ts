import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { ConfigurationService } from '../../services/configuration.service';
import { IConfigurationGetBaseResponseDto } from '../../types/configuration.dto';

@Component({
  selector: 'app-delete-configuration',
  imports: [],
  templateUrl: './delete-configuration.component.html',
  styleUrl: './delete-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfigurationComponent implements IDialogActionHandler {
  private readonly configurationService = inject(ConfigurationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IConfigurationGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  onDialogAccept(): void {
    const configuration = this.selectedRecord()?.[0];
    if (!configuration) {
      this.logger.error('Delete configuration: no record selected');
      this.notificationService.error('Failed to delete configuration.');
      return;
    }

    this.loadingService.show({
      title: 'Deleting configuration',
      message:
        "We're removing the configuration. This will just take a moment.",
    });

    this.configurationService
      .deleteConfiguration(configuration.id)
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ message }) => {
          this.notificationService.success(
            message || 'Configuration deleted successfully.'
          );
          this.appConfigurationService.invalidateConfigurationDropdowns([
            configuration.key,
          ]);
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete configuration.', error);
          this.notificationService.error('Failed to delete configuration.');
        },
      });
  }
}
