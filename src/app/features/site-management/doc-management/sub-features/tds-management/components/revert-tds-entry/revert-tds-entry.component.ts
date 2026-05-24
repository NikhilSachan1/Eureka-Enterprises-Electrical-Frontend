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
import { REVERT_TDS_ENTRY_FORM_CONFIG } from '../../config';
import { TdsService } from '../../services/tds.service';
import {
  ITdsEntryGetBaseResponseDto,
  IRevertTdsEntryFormDto,
  IRevertTdsEntryResponseDto,
} from '../../types/tds.dto';

@Component({
  selector: 'app-revert-tds-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './revert-tds-entry.component.html',
  styleUrl: './revert-tds-entry.component.scss',
})
export class RevertTdsEntryComponent
  extends FormBase<IRevertTdsEntryFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly tdsService = inject(TdsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<ITdsEntryGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to revert TDS entry but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRevertTdsEntryFormDto>(
      REVERT_TDS_ENTRY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const tdsEntryId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeRevertAction(formData, tdsEntryId);
  }

  private prepareFormData(): IRevertTdsEntryFormDto {
    return this.form.getData();
  }

  private executeRevertAction(
    formData: IRevertTdsEntryFormDto,
    tdsEntryId: string
  ): void {
    this.loadingService.show({
      title: 'Reverting verification',
      message:
        "We're reverting verification for this entry. This will just take a moment.",
    });
    this.form.disable();

    this.tdsService
      .revertTdsEntry(tdsEntryId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRevertTdsEntryResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to revert TDS entry verification', error);
          this.notificationService.error(
            'Failed to revert TDS entry verification.'
          );
        },
      });
  }
}
