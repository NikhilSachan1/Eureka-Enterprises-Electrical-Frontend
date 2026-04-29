import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IDocAddFormDto,
  IDocAddResponseDto,
  IDocPaymentUIFormDto,
} from '../../types/doc.dto';
import { IDialogActionHandler } from '@shared/types';
import { DocService } from '../../services/doc.service';
import { ConfirmationDialogService } from '@shared/services';
import { IProjectGetBaseResponseDto } from '@features/site-management/project-management/types/project.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { PAYMENT_DOC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './payment-doc.component.html',
  styleUrl: './payment-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDocComponent
  extends FormBase<IDocPaymentUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docService = inject(DocService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IProjectGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to perform action on Payment document but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IDocPaymentUIFormDto>(
      PAYMENT_DOC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeDocAction(formData);
  }

  private prepareFormData(): IDocPaymentUIFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeDocAction(formData: IDocPaymentUIFormDto): void {
    this.loadingService.show({
      title: 'Adding Payment Document',
      message:
        "We're adding the Payment document. This will just take a moment.",
    });
    this.form.disable();

    this.docService
      .addDoc(formData as unknown as IDocAddFormDto)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
