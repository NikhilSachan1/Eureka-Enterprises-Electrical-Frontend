import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import {
  IAddPoFormDto,
  IAddPoResponseDto,
  IAddPoUIFormDto,
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
import { ADD_PO_FORM_CONFIG } from '../../config';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PoTermsEditorComponent } from '../po-terms-editor/po-terms-editor.component';
import { roundCurrencyAmount } from '@shared/utility';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';
import {
  computePoLineItemAmount,
  mapPoItemSuggestionsToDropdown,
  mapPoLineItemsForRequest,
} from '../../utils/po-line-item.util';
import { joinPoTerms, mapPoTermsForForm } from '../../utils/po-terms.util';

type AddPoStakeholderField = 'contractorName' | 'vendorName';

@Component({
  selector: 'app-add-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, PoTermsEditorComponent, ReactiveFormsModule],
  templateUrl: './add-po.component.html',
  styleUrl: './add-po.component.scss',
})
export class AddPoComponent
  extends FormBase<IAddPoUIFormDto>
  implements OnInit, IDialogActionHandler {
  private readonly poService = inject(PoService);
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly formBuilder = inject(FormBuilder);

  private trackedPoInputs!: ITrackedFields<IAddPoUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly projectName = input<string>();
  protected readonly isSystemGenerated = input(false);

  readonly EDocContext = EDocContext;

  constructor() {
    super();
    effect(() => {
      const tracked = this.trackedPoInputs;
      tracked?.taxableAmount?.();
      tracked?.gstPercent?.();
      this.recalcGstAndTotal();
    });
    effect(() => {
      if (this.trackedPoInputs?.projectName) {
        const projectId = this.trackedPoInputs.projectName();
        if (projectId && typeof projectId === 'string') {
          this.loadProjectStakeholderOptions(projectId);
          return;
        }

        this.resetPoDateField();
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddPoUIFormDto>(
      ADD_PO_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          docContext: this.docContext(),
          isSystemGenerated: this.isSystemGenerated(),
        },
        defaultValues: {
          projectName: this.projectName(),
          terms: [],
        },
      }
    );

    this.trackedPoInputs =
      this.formService.trackMultipleFieldChanges<IAddPoUIFormDto>(
        this.form.formGroup,
        ['projectName', 'taxableAmount', 'gstPercent'],
        this.destroyRef
      );

    if (this.isSystemGenerated()) {
      this.setupPoItemNameTypeahead();
      this.setupLineItemAmountSync();
      this.loadDefaultTerms();
      queueMicrotask(() => this.changeDetectorRef.detectChanges());
    }
  }

  private loadDefaultTerms(): void {
    this.poService
      .getPoDefaultTerms()
      .pipe(
        catchError(() => of({ content: '' })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(response => {
        this.patchTerms(mapPoTermsForForm(response.content));
        this.changeDetectorRef.detectChanges();
      });
  }

  private patchTerms(terms: Array<{ content: string }>): void {
    const termsArray = this.form.formGroup.get('terms') as FormArray<FormGroup> | null;
    if (!termsArray) {
      return;
    }

    termsArray.clear();
    terms.forEach(term => {
      termsArray.push(
        this.formBuilder.group({
          content: [term.content, [Validators.required]],
        })
      );
    });

    const termsConfig = this.form.fieldConfigs.terms;
    if (termsConfig) {
      this.form.fieldConfigs.terms = { ...termsConfig };
    }
  }

  private setupPoItemNameTypeahead(): void {
    const itemsConfig = this.form.fieldConfigs.items;
    const lineItemsConfig = itemsConfig?.lineItemsConfig;
    const itemNameField = lineItemsConfig?.fields?.['itemName'];

    if (!itemsConfig || !lineItemsConfig || !itemNameField) {
      return;
    }

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
      .subscribe(() => this.syncLineItemAmounts());
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
        group.get('amount')?.setValue(amount, { emitEvent: true, onlySelf: true });
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

  private loadProjectStakeholderOptions(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'poDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    if (this.docContext() === EDocContext.SALES) {
      this.applyStakeholderOptions('contractorName', [], true);
    }
    if (this.docContext() === EDocContext.PURCHASE) {
      this.applyStakeholderOptions('vendorName', [], true);
    }

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          const contractorIds = (response.contractors ?? [])
            .map(contractor => contractor?.id)
            .filter((id): id is string => !!id);
          const vendorIds = (response.vendors ?? [])
            .map(vendor => vendor?.id)
            .filter((id): id is string => !!id);

          if (this.docContext() === EDocContext.SALES) {
            this.applyStakeholderOptions(
              'contractorName',
              contractorIds,
              false
            );
          }
          if (this.docContext() === EDocContext.PURCHASE) {
            this.applyStakeholderOptions('vendorName', vendorIds, false);
          }

          applyProjectDateRangeFromOverview(
            this.form,
            'poDate',
            ADD_PO_FORM_CONFIG.fields.poDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.notificationService.error(
            'Could not load project details. Please try again.'
          );
          if (this.docContext() === EDocContext.SALES) {
            this.applyStakeholderOptions('contractorName', [], false);
          }
          if (this.docContext() === EDocContext.PURCHASE) {
            this.applyStakeholderOptions('vendorName', [], false);
          }
          this.resetPoDateField();
        },
      });
  }

  private resetPoDateField(): void {
    resetProjectDateField(
      this.form,
      'poDate',
      ADD_PO_FORM_CONFIG.fields.poDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private applyStakeholderOptions(
    fieldName: AddPoStakeholderField,
    availableIds: string[],
    loading: boolean
  ): void {
    const defaultSelectConfig =
      ADD_PO_FORM_CONFIG.fields[fieldName].selectConfig;
    if (!defaultSelectConfig) {
      return;
    }

    const hasOptions = availableIds.length > 0;
    const emptyMessage =
      fieldName === 'contractorName'
        ? 'No contractor found'
        : 'No vendor found';
    const base = this.form.fieldConfigs[fieldName];

    this.form.fieldConfigs[fieldName] = {
      ...base,
      selectConfig: {
        ...defaultSelectConfig,
        ...(hasOptions
          ? {
            filterOptions: {
              include: availableIds,
            },
          }
          : {
            optionsDropdown: [],
            dynamicDropdown: undefined,
            filterOptions: undefined,
            emptyMessage,
          }),
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private recalcGstAndTotal(): void {
    const tracked = this.trackedPoInputs;
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
    this.executeAddPoAction();
  }

  private executeAddPoAction(): void {
    const isGenerate = this.isSystemGenerated();

    this.loadingService.show({
      title: isGenerate ? 'Generating PO' : 'Adding PO',
      message: isGenerate
        ? "Please wait while we're generating the PO. This will just take a moment."
        : "Please wait while we're adding the PO. This will just take a moment.",
    });
    this.form.disable();

    const submit$ = isGenerate
      ? this.poService.addPo(this.prepareFormData())
      : this.attachmentsService
        .uploadFinancialDocument(this.form.getFieldData('poAttachment')[0])
        .pipe(
          switchMap(attachmentResponse =>
            this.poService.addPo(this.prepareFormData(attachmentResponse))
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
        next: (response: IAddPoResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(
            isGenerate ? 'Failed to generate PO' : 'Failed to add PO',
            error
          );
          this.notificationService.error(
            isGenerate
              ? 'Could not generate the PO. Please try again.'
              : 'Could not add the PO. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto | null = null
  ): IAddPoFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['poAttachment'];
    const terms = record.terms;
    delete (record as Record<string, unknown>)['terms'];

    if (this.isSystemGenerated()) {
      return {
        ...record,
        poFileName: null,
        poFileKey: null,
        docType: this.docContext(),
        items: mapPoLineItemsForRequest(record.items),
        termsAndConditions: joinPoTerms(terms),
      };
    }

    return {
      ...record,
      taxableAmount: roundCurrencyAmount(Number(record.taxableAmount)),
      gstAmount: roundCurrencyAmount(Number(record.gstAmount)),
      totalAmount: roundCurrencyAmount(Number(record.totalAmount)),
      docType: this.docContext(),
      poFileKey: attachmentResponse?.fileKey ?? null,
      poFileName: attachmentResponse?.fileName ?? null,
    };
  }
}
