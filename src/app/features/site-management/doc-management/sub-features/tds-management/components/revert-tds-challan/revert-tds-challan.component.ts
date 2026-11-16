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

/** Asks for a reason and reverts the challan the selected entry was deposited with. */
@Component({
  selector: 'app-revert-tds-challan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './revert-tds-challan.component.html',
  styleUrl: './revert-tds-challan.component.scss',
})
export class RevertTdsChallanComponent
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

  private tdsPaymentId: string | null = null;

  ngOnInit(): void {
    this.tdsPaymentId = this.selectedRecord()?.[0]?.tdsPaymentId ?? null;
    if (!this.tdsPaymentId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'An entry with a recorded challan is required to revert the challan'
      );
      return;
    }

    this.form = this.formService.createForm<IRevertTdsEntryFormDto>(
      REVERT_TDS_ENTRY_FORM_CONFIG,
      { destroyRef: this.destroyRef }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    if (!this.tdsPaymentId) {
      return;
    }
    this.executeRevertAction(this.form.getData(), this.tdsPaymentId);
  }

  private executeRevertAction(
    formData: IRevertTdsEntryFormDto,
    tdsPaymentId: string
  ): void {
    this.loadingService.show({
      title: 'Reverting challan',
      message:
        "We're reverting this TDS challan. This will just take a moment.",
    });
    this.form.disable();

    this.tdsService
      .revertTdsChallan(tdsPaymentId, formData)
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
          this.logger.error('Failed to revert TDS challan', error);
          this.notificationService.error('Failed to revert the TDS challan.');
        },
      });
  }
}
