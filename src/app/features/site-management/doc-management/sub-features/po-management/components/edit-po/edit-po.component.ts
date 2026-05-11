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
  IEditPoFormDto,
  IEditPoResponseDto,
  IEditPoUIFormDto,
  IPoGetBaseResponseDto,
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
import { EDIT_PO_FORM_CONFIG } from '../../config';
import { finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

@Component({
  selector: 'app-edit-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-po.component.html',
  styleUrl: './edit-po.component.scss',
})
export class EditPoComponent
  extends FormBase<IEditPoUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly poService = inject(PoService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  private trackedGstInputs!: ITrackedFields<IEditPoUIFormDto>;

  private allowGstAutoRecalc = false;

  /** Taxable / GST % values when the dialog opened; auto-GST runs only after either diverges. */
  private prefilledTaxableAmount: number | null = null;
  private prefilledGstPercent: number | null = null;

  protected readonly selectedRecord = input.required<IPoGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  readonly EDocContext = EDocContext;

  constructor() {
    super();
    effect(() => {
      const tracked = this.trackedGstInputs;
      const taxable = tracked?.taxableAmount?.();
      const gstPercent = tracked?.gstPercent?.();
      const { prefilledTaxableAmount } = this;
      const { prefilledGstPercent } = this;
      if (
        prefilledTaxableAmount !== null &&
        prefilledGstPercent !== null &&
        tracked !== undefined
      ) {
        if (
          taxable !== prefilledTaxableAmount ||
          gstPercent !== prefilledGstPercent
        ) {
          this.allowGstAutoRecalc = true;
        }
      }
      this.recalcGstAndTotal();
    });
  }

  ngOnInit(): void {
    const rows = this.selectedRecord();
    const record = rows?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit PO: selected record was not provided');
      return;
    }

    this.form = this.formService.createForm<IEditPoUIFormDto>(
      EDIT_PO_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: { docContext: this.docContext() },
        defaultValues: {
          projectName: record.siteId,
          contractorName: record.contractorId ?? undefined,
          vendorName: record.vendorId ?? undefined,
          poNumber: record.poNumber,
          poDate: new Date(record.poDate),
          taxableAmount: Number(record.taxableAmount),
          gstPercent: Number(record.gstPercentage),
          gstAmount: Number(record.gstAmount),
          totalAmount: Number(record.totalAmount),
          poAttachment: [],
          remarks: record.remarks ?? null,
        },
      }
    );

    this.trackedGstInputs =
      this.formService.trackMultipleFieldChanges<IEditPoUIFormDto>(
        this.form.formGroup,
        ['taxableAmount', 'gstPercent'],
        this.destroyRef
      );

    const { taxableAmount, gstPercent } = this.trackedGstInputs.getValues();
    this.prefilledTaxableAmount =
      taxableAmount === null || taxableAmount === undefined
        ? null
        : Number(taxableAmount);
    this.prefilledGstPercent =
      gstPercent === null || gstPercent === undefined
        ? null
        : Number(gstPercent);

    this.loadPrefillAttachmentFromKey(record.fileKey);
  }

  private loadPrefillAttachmentFromKey(fileKey: string): void {
    this.loadingService.show({
      title: 'Loading PO data',
      message: 'Fetching the PO data. Please wait…',
    });
    this.attachmentsService
      .loadFilesFromKeys([fileKey])
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: files => {
          this.form.patch({ poAttachment: files });
        },
        error: error => {
          this.logger.error('Failed to prefetch PO attachment', error);
          this.notificationService.error(
            'Could not load the attachment. You can upload a new file.'
          );
        },
      });
  }

  private recalcGstAndTotal(): void {
    const tracked = this.trackedGstInputs;
    if (!tracked || !this.allowGstAutoRecalc) {
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
    const record = this.selectedRecord()[0];
    if (!record?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeEditPoAction(record.id);
  }

  private executeEditPoAction(poId: string): void {
    const file = this.form.getFieldData('poAttachment');

    this.loadingService.show({
      title: 'Updating PO',
      message:
        'Please wait while we update the PO. This will just take a moment.',
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.poService.editPo(formData, poId);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditPoResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit PO', error);
          this.notificationService.error(
            'Could not update the PO. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IEditPoFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['poAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['contractorName'];
    delete (record as Record<string, unknown>)['vendorName'];
    return {
      ...record,
      poFileKey: attachmentResponse.fileKey,
      poFileName: attachmentResponse.fileName,
    };
  }
}
