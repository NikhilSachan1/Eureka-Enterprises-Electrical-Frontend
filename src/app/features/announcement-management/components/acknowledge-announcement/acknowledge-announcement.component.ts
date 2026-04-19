import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnnouncementService } from '@features/announcement-management/services/announcement.service';
import {
  IAnnouncementAcknowledgeFormDto,
  IAnnouncementUnacknowledgeGetBaseResponseDto,
} from '@features/announcement-management/types/announcement.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { AnnouncementContentPreviewComponent } from '../announcement-content-preview/announcement-content-preview.component';

@Component({
  selector: 'app-acknowledge-announcement',
  standalone: true,
  imports: [AnnouncementContentPreviewComponent],
  templateUrl: './acknowledge-announcement.component.html',
  styleUrl: './acknowledge-announcement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcknowledgeAnnouncementComponent
  extends FormBase<IAnnouncementAcknowledgeFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly announcementService = inject(AnnouncementService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAnnouncementUnacknowledgeGetBaseResponseDto>();
  protected readonly onDialogClose = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to show announcement but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  onDialogReject(): void {
    this.confirmationDialogService.closeDialog();
    this.onDialogClose()?.();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAnnouncementAcknowledgeAction(formData);
  }

  private prepareFormData(): IAnnouncementAcknowledgeFormDto {
    const record = this.selectedRecord();
    return {
      announcementId: record.id,
    };
  }

  private executeAnnouncementAcknowledgeAction(
    formData: IAnnouncementAcknowledgeFormDto
  ): void {
    const loadingMessage = {
      title: 'Acknowledging Announcement',
      message:
        "We're acknowledging the announcement. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.announcementService
      .acknowledgeAnnouncement(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Announcement acknowledged successfully'
          );
          this.confirmationDialogService.closeDialog();
          this.onDialogClose()?.();
        },
      });
  }
}
