import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { roundCurrencyAmount } from '@shared/utility';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import { getPrefilledProjectNameFormDefaults } from '@features/site-management/project-management/utility/project-workspace-dialog.util';

type AddPoStakeholderField = 'contractorName' | 'vendorName';

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
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedPoInputs!: ITrackedFields<IAddPoUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly prefilledProjectId = input<string>();

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
        }
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
        },
        defaultValues: getPrefilledProjectNameFormDefaults(
          this.prefilledProjectId()
        ),
      }
    );

    this.trackedPoInputs =
      this.formService.trackMultipleFieldChanges<IAddPoUIFormDto>(
        this.form.formGroup,
        ['projectName', 'taxableAmount', 'gstPercent'],
        this.destroyRef
      );
  }

  private loadProjectStakeholderOptions(projectId: string): void {
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
        },
      });
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
    delete (record as Record<string, unknown>)['poAttachment'];
    return {
      ...record,
      taxableAmount: roundCurrencyAmount(Number(record.taxableAmount)),
      gstAmount: roundCurrencyAmount(Number(record.gstAmount)),
      totalAmount: roundCurrencyAmount(Number(record.totalAmount)),
      docType: this.docContext(),
      poFileKey: attachmentResponse.fileKey,
      poFileName: attachmentResponse.fileName,
    };
  }
}
