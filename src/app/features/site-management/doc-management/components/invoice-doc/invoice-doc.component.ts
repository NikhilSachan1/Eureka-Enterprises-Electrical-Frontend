import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IDocGetBaseResponseDto,
  IInvoiceDocAddFormDto,
  IInvoiceDocAddResponseDto,
} from '../../types/doc.dto';
import { IDialogActionHandler } from '@shared/types';
import { DocService } from '../../services/doc.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { INVOICE_DOC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-invoice-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './invoice-doc.component.html',
  styleUrl: './invoice-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDocComponent
  extends FormBase<IInvoiceDocAddFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docService = inject(DocService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to perform action on Invoice document but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IInvoiceDocAddFormDto>(
      INVOICE_DOC_FORM_CONFIG,
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

  private prepareFormData(): IInvoiceDocAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeDocAction(formData: IInvoiceDocAddFormDto): void {
    this.loadingService.show({
      title: 'Adding Invoice Document',
      message:
        "We're adding the Invoice document. This will just take a moment.",
    });
    this.form.disable();

    this.docService
      .addInvoiceDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IInvoiceDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
