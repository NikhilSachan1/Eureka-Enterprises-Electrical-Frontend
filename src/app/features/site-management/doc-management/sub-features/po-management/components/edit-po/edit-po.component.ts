import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  IInputFieldsConfig,
  ITrackedFields,
} from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { PoService } from '../../services/po.service';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { EDIT_PO_FORM_CONFIG, ADD_PO_DEFAULT_GST_TYPE } from '../../config';
import { finalize, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PoTermsEditorComponent } from '../po-terms-editor/po-terms-editor.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { roundCurrencyAmount } from '@shared/utility';
import {
  applyProjectDateRangeFromSite,
  IProjectSiteDateRange,
  parseProjectDateOnly,
} from '@features/site-management/project-management/utility/project-overview-date.util';
import {
  computePoLineItemAmount,
  mapPoLineItemsForForm,
  mapPoLineItemsForRequest,
  mapPoItemSuggestionsToDropdown,
} from '../../utils/po-line-item.util';
import { isPoSystemGenerated } from '../../utils/po-table-row.util';
import { joinPoTerms, mapPoTermsForForm } from '../../utils/po-terms.util';

@Component({
  selector: 'app-edit-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, PoTermsEditorComponent, ReactiveFormsModule],
  templateUrl: './edit-po.component.html',
  styleUrl: './edit-po.component.scss',
})
export class EditPoComponent
  extends FormBase<IEditPoUIFormDto>
  implements OnInit, IDialogActionHandler {
  private readonly poService = inject(PoService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private trackedGstInputs!: ITrackedFields<IEditPoUIFormDto>;

  private allowGstAutoRecalc = false;
  private allowLineItemAmountSync = false;

  /** Taxable / GST % values when the dialog opened; auto-GST runs only after either diverges. */
  private prefilledTaxableAmount: number | null = null;
  private prefilledGstPercent: number | null = null;

  protected readonly selectedRecord = input.required<IPoGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  protected readonly isSystemGenerated = computed(() =>
    isPoSystemGenerated(this.selectedRecord()[0])
  );

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

    this.initializeEditForm(record);
  }

  private initializeEditForm(record: IPoGetBaseResponseDto): void {
    const systemGenerated = this.isSystemGenerated();
    const lineItems = mapPoLineItemsForForm(record.items);

    this.form = this.formService.createForm<IEditPoUIFormDto>(
      EDIT_PO_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          docContext: this.docContext(),
          isSystemGenerated: systemGenerated,
        },
        defaultValues: {
          projectName: record.siteId,
          contractorName: record.contractorId ?? undefined,
          vendorName: record.vendorId ?? undefined,
          poNumber: record.poNumber,
          poDate: parseProjectDateOnly(record.poDate),
          taxableAmount: Number(record.taxableAmount),
          gstPercent: Number(record.gstPercentage),
          gstAmount: Number(record.gstAmount),
          totalAmount: Number(record.totalAmount),
          gstType: record.gstType ?? ADD_PO_DEFAULT_GST_TYPE,
          poAttachment: [],
          remarks: record.remarks ?? null,
          terms: systemGenerated
            ? mapPoTermsForForm(record.termsAndConditions)
            : [],
          ...(systemGenerated && lineItems.length ? { items: lineItems } : {}),
        },
      }
    );

    this.trackedGstInputs =
      this.formService.trackMultipleFieldChanges<IEditPoUIFormDto>(
        this.form.formGroup,
        ['taxableAmount', 'gstPercent'],
        this.destroyRef
      );

    applyProjectDateRangeFromSite(
      this.form,
      'poDate',
      EDIT_PO_FORM_CONFIG.fields.poDate.dateConfig,
      record.site as IProjectSiteDateRange
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

    if (systemGenerated) {
      this.setupPoItemNameTypeahead(lineItems);
      this.setupLineItemAmountSync();
      queueMicrotask(() => {
        this.changeDetectorRef.detectChanges();
        this.allowLineItemAmountSync = true;
      });
      return;
    }

    if (record.fileKey) {
      this.loadPrefillAttachmentFromKey(record.fileKey);
    }
  }

  private setupPoItemNameTypeahead(lineItems: IEditPoUIFormDto['items']): void {
    const itemsConfig = this.form.fieldConfigs.items;
    const lineItemsConfig = itemsConfig?.lineItemsConfig;
    const itemNameField = lineItemsConfig?.fields?.['itemName'];

    if (!itemsConfig || !lineItemsConfig || !itemNameField) {
      return;
    }

    const seededOptions = mapPoItemSuggestionsToDropdown(
      (lineItems ?? []).map(item => ({
        name: String(item.itemName ?? ''),
      }))
    );

    this.form.fieldConfigs.items = {
      ...itemsConfig,
      lineItemsConfig: {
        ...lineItemsConfig,
        fields: {
          ...lineItemsConfig.fields,
          itemName: {
            ...itemNameField,
            autocompleteConfig: {
              ...itemNameField.autocompleteConfig,
              optionsDropdown: seededOptions,
              onSearch: (query: string) => {
                const search = query.trim();
                return this.poService
                  .getPoItemSuggestions(search ? { search } : {})
                  .pipe(
                    map(response =>
                      mapPoItemSuggestionsToDropdown(response.records)
                    )
                  );
              },
              remoteSearchDebounceMs: 300,
            },
          },
        },
      },
    } as IInputFieldsConfig;
  }

  private setupLineItemAmountSync(): void {
    const items = this.form.formGroup.get('items') as FormArray<FormGroup> | null;
    items?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.allowLineItemAmountSync) {
          return;
        }
        this.syncLineItemAmounts();
      });
  }

  private syncLineItemAmounts(): void {
    const items = this.form.formGroup.get('items') as FormArray<FormGroup> | null;
    if (!items) {
      return;
    }

    items.controls.forEach(group => {
      const quantity = Number(group.get('quantity')?.value);
      const rate = Number(group.get('rate')?.value);
      const amount = computePoLineItemAmount(quantity, rate);
      if (group.get('amount')?.value !== amount) {
        group.get('amount')?.setValue(amount, { emitEvent: false, onlySelf: true });
      }
    });

    const taxableAmount = roundCurrencyAmount(
      items.controls.reduce((sum, group) => {
        return sum + Number(group.get('amount')?.value || 0);
      }, 0)
    );

    if (this.form.formGroup.get('taxableAmount')?.value !== taxableAmount) {
      this.form.formGroup.patchValue({ taxableAmount });
    }
    this.changeDetectorRef.detectChanges();
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

    const gst = roundCurrencyAmount(taxable * (gstPercentValue / 100));
    const total = roundCurrencyAmount(taxable + gst);
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
    const isSystemGenerated = this.isSystemGenerated();

    this.loadingService.show({
      title: 'Updating PO',
      message:
        'Please wait while we update the PO. This will just take a moment.',
    });
    this.form.disable();

    const submit$ = isSystemGenerated
      ? this.poService.editPo(this.prepareFormData(), poId)
      : this.attachmentsService
        .uploadFinancialDocument(this.form.getFieldData('poAttachment')[0])
        .pipe(
          switchMap(attachmentResponse =>
            this.poService.editPo(
              this.prepareFormData(attachmentResponse),
              poId
            )
          )
        );

    submit$
      .pipe(
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
    attachmentResponse: IFinancialFileUploadResponseDto | null = null
  ): IEditPoFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['poAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['contractorName'];
    delete (record as Record<string, unknown>)['vendorName'];
    const terms = record.terms;
    delete (record as Record<string, unknown>)['terms'];

    if (this.isSystemGenerated()) {
      return {
        ...record,
        poFileName: null,
        poFileKey: null,
        items: mapPoLineItemsForRequest(record.items),
        termsAndConditions: joinPoTerms(terms),
      };
    }

    return {
      ...record,
      taxableAmount: roundCurrencyAmount(Number(record.taxableAmount)),
      gstAmount: roundCurrencyAmount(Number(record.gstAmount)),
      totalAmount: roundCurrencyAmount(Number(record.totalAmount)),
      poFileKey: attachmentResponse?.fileKey ?? null,
      poFileName: attachmentResponse?.fileName ?? null,
    };
  }
}
