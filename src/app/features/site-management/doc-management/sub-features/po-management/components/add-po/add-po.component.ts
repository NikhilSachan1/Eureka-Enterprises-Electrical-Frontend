import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IAddPoFormDto,
  IAddPoResponseDto,
  IAddPoUIFormDto,
} from '../../types/po.dto';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
  ITrackedFields,
} from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { PoService } from '../../services/po.service';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { ADD_PO_FORM_CONFIG } from '../../config';
import { finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-po.component.html',
  styleUrl: './add-po.component.scss',
})
export class AddPoComponent
  extends FormBase<IAddPoUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly poService = inject(PoService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  private trackedGstInputs!: ITrackedFields<IAddPoUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  readonly EDocContext = EDocContext;

  constructor() {
    super();
    effect(() => {
      const tracked = this.trackedGstInputs;
      tracked.taxableAmount?.();
      tracked.gstPercent?.();
      this.recalcGstAndTotal();
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddPoUIFormDto>(
      ADD_PO_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          docContext: this.docContext(),
        },
      }
    );

    this.trackedGstInputs =
      this.formService.trackMultipleFieldChanges<IAddPoUIFormDto>(
        this.form.formGroup,
        ['taxableAmount', 'gstPercent'],
        this.destroyRef
      );
  }

  private recalcGstAndTotal(): void {
    const tracked = this.trackedGstInputs;
    if (!tracked) {
      return;
    }
    const { taxableAmount, gstPercent } = tracked.getValues();
    const taxable =
      taxableAmount === null || taxableAmount === undefined
        ? NaN
        : Number(taxableAmount);
    const gstPercentValue =
      gstPercent === null || gstPercent === undefined
        ? NaN
        : Number(gstPercent);

    if (isNaN(taxable) || isNaN(gstPercentValue)) {
      return;
    }

    const gst = taxable * (gstPercentValue / 100);
    const total = taxable + gst;
    this.form.formGroup.patchValue({
      gstAmount: gst,
      totalAmount: total,
    });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAddPoAction();
  }

  private executeAddPoAction(): void {
    const file = this.form.getFieldData('poAttachment');

    this.loadingService.show({
      title: 'Adding PO',
      message:
        "Please wait while we're adding the PO. This will just take a moment.",
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.poService.addPo(formData);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddPoResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add PO', error);
          this.notificationService.error(
            'Could not add the PO. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IAddPoFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['gstPercent'];
    delete (record as Record<string, unknown>)['poAttachment'];
    return {
      ...record,
      docType: this.docContext(),
      poFileKey: attachmentResponse.fileKey,
      poFileName: attachmentResponse.fileName,
    };
  }
}
