import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { REVERT_GST_ENTRY_FORM_CONFIG } from '../../config';
import { GstService } from '../../services/gst.service';
import {
  IGstEntryGetBaseResponseDto,
  IRevertGstEntryFormDto,
  IRevertGstEntryResponseDto,
} from '../../types/gst.dto';

@Component({
  selector: 'app-revert-gst-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './revert-gst-entry.component.html',
  styleUrl: './revert-gst-entry.component.scss',
})
export class RevertGstEntryComponent
  extends FormBase<IRevertGstEntryFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly gstService = inject(GstService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IGstEntryGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to revert GST entry but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRevertGstEntryFormDto>(
      REVERT_GST_ENTRY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const gstEntryId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeRevertAction(formData, gstEntryId);
  }

  private prepareFormData(): IRevertGstEntryFormDto {
    return this.form.getData();
  }

  private executeRevertAction(
    formData: IRevertGstEntryFormDto,
    gstEntryId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting verification',
      message:
        "We're reverting verification for this entry. This will just take a moment.",
    });
    this.form.disable();

    this.gstService
      .revertGstEntry(gstEntryId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRevertGstEntryResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject GST entry verification', error);
          this.notificationService.error(
            'Failed to reject GST entry verification.'
          );
        },
      });
  }
}
