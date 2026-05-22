import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FORCE_DSR_FORM_CONFIG } from '@features/site-management/dsr-management/config';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  IDsrForceFormDto,
  IDsrForceResponseDto,
  IDsrForceUIFormDto,
} from '@features/site-management/dsr-management/types/dsr.dto';
import { FormBase } from '@shared/base/form.base';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';

@Component({
  selector: 'app-force-dsr',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './force-dsr.component.html',
  styleUrl: './force-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceDsrComponent
  extends FormBase<IDsrForceUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly dsrService = inject(DsrService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    this.form = this.formService.createForm<IDsrForceUIFormDto>(
      FORCE_DSR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeForceDsr(this.form.getData());
  }

  private executeForceDsr(formData: IDsrForceFormDto): void {
    this.loadingService.show({
      title: 'Force DSR',
      message:
        "Please wait while we're adding the DSR on behalf of the employee. This will just take a moment.",
    });
    this.form.disable();

    this.dsrService
      .forceDsr(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrForceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to force DSR', error);
          this.notificationService.error('Failed to force DSR.');
        },
      });
  }
}
