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
  IPoDocAddFormDto,
  IPoDocAddResponseDto,
} from '../../types/doc.dto';
import { IDialogActionHandler, IFormConfig } from '@shared/types';
import { DocService } from '../../services/doc.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { PO_DOC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-po-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './po-doc.component.html',
  styleUrl: './po-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoDocComponent
  extends FormBase<IPoDocAddFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docService = inject(DocService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input<'sales' | 'purchase'>('sales');

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to perform action on PO document but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IPoDocAddFormDto>(
      this.getPoFormConfig(),
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

  private prepareFormData(): IPoDocAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private getPoFormConfig(): IFormConfig<IPoDocAddFormDto> {
    if (this.docContext() !== 'purchase') {
      return PO_DOC_FORM_CONFIG;
    }

    return {
      ...PO_DOC_FORM_CONFIG,
      fields: {
        ...PO_DOC_FORM_CONFIG.fields,
        contractorName: {
          ...PO_DOC_FORM_CONFIG.fields.contractorName,
          label: 'Vendor Name',
        },
      },
    };
  }

  private executeDocAction(formData: IPoDocAddFormDto): void {
    this.loadingService.show({
      title: 'Adding PO Document',
      message: "We're adding the PO document. This will just take a moment.",
    });
    this.form.disable();

    this.docService
      .addPoDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPoDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
