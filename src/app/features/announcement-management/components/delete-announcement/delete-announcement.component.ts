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
  IAnnouncementDeleteFormDto,
  IAnnouncementDeleteResponseDto,
  IAnnouncementGetBaseResponseDto,
} from '@features/announcement-management/types/announcement.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-announcement',
  imports: [],
  templateUrl: './delete-announcement.component.html',
  styleUrl: './delete-announcement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAnnouncementComponent
  extends FormBase<IAnnouncementDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly announcementService = inject(AnnouncementService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAnnouncementGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete announcement but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeAnnouncementDeleteAction(formData);
  }

  private prepareFormData(
    record: IAnnouncementGetBaseResponseDto[]
  ): IAnnouncementDeleteFormDto {
    return {
      announcementIds: record.map(
        (row: IAnnouncementGetBaseResponseDto) => row.id
      ),
    };
  }

  private executeAnnouncementDeleteAction(
    formData: IAnnouncementDeleteFormDto
  ): void {
    const loadingMessage = {
      title: 'Deleting Announcement',
      message: "We're removing the announcement. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.announcementService
      .deleteAnnouncement(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAnnouncementDeleteResponseDto) => {
          this.notificationService.bulkOperationFromApiResponse(
            response,
            'announcement',
            EButtonActionType.DELETE
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
