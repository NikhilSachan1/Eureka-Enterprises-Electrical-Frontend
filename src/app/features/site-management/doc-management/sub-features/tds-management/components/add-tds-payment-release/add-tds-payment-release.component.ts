import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
  IInputFieldsConfig,
  ITrackedFields,
} from '@shared/types';
import { finalize, switchMap } from 'rxjs';
import { ADD_TDS_PAYMENT_RELEASE_FORM_CONFIG } from '../../config/form/add-tds-payment-release.config';
import { TdsService } from '../../services/tds.service';
import {
  IAddTdsPaymentReleaseFormDto,
  IAddTdsPaymentReleaseResponseDto,
  IAddTdsPaymentReleaseUIFormDto,
} from '../../types/tds.dto';

@Component({
  selector: 'app-add-tds-payment-release',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-tds-payment-release.component.html',
  styleUrl: './add-tds-payment-release.component.scss',
})
export class AddTdsPaymentReleaseComponent
  extends FormBase<IAddTdsPaymentReleaseUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly tdsService = inject(TdsService);
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedInputs!: ITrackedFields<IAddTdsPaymentReleaseUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly projectName = input<string>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedInputs?.projectName) {
        const projectId = this.trackedInputs.projectName();
        if (projectId && typeof projectId === 'string') {
          this.loadProjectVendorOptions(projectId);
          return;
        }

        this.resetPaymentDateField();
        this.applyVendorOptions([], false);
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddTdsPaymentReleaseUIFormDto>(
      ADD_TDS_PAYMENT_RELEASE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    this.trackedInputs =
      this.formService.trackMultipleFieldChanges<IAddTdsPaymentReleaseUIFormDto>(
        this.form.formGroup,
        ['projectName'],
        this.destroyRef
      );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAddTdsPaymentReleaseAction();
  }

  private loadProjectVendorOptions(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'paymentDate', true);
    this.applyVendorOptions([], true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          const vendorIds = (response.vendors ?? [])
            .map(vendor => vendor?.id)
            .filter((id): id is string => !!id);

          this.applyVendorOptions(vendorIds, false);

          applyProjectDateRangeFromOverview(
            this.form,
            'paymentDate',
            ADD_TDS_PAYMENT_RELEASE_FORM_CONFIG.fields.paymentDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.notificationService.error(
            'Could not load project details. Please try again.'
          );
          this.applyVendorOptions([], false);
          this.resetPaymentDateField();
        },
      });
  }

  private resetPaymentDateField(): void {
    resetProjectDateField(
      this.form,
      'paymentDate',
      ADD_TDS_PAYMENT_RELEASE_FORM_CONFIG.fields.paymentDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private applyVendorOptions(availableIds: string[], loading: boolean): void {
    const defaultSelectConfig =
      ADD_TDS_PAYMENT_RELEASE_FORM_CONFIG.fields.vendorName.selectConfig;
    if (!defaultSelectConfig) {
      return;
    }

    const hasOptions = availableIds.length > 0;
    const base = this.form.fieldConfigs.vendorName;

    this.form.fieldConfigs.vendorName = {
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
              emptyMessage: 'No vendor found',
            }),
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private executeAddTdsPaymentReleaseAction(): void {
    const file = this.form.getFieldData('paymentAttachment');

    this.loadingService.show({
      title: 'Releasing TDS payment',
      message:
        "Please wait while we're recording the TDS payment release. This will just take a moment.",
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.tdsService.addTdsPaymentRelease(formData);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddTdsPaymentReleaseResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to release TDS payment', error);
          this.notificationService.error(
            'Could not record the TDS payment release. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IAddTdsPaymentReleaseFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['paymentAttachment'];
    return {
      ...record,
      fileKey: attachmentResponse.fileKey,
      fileName: attachmentResponse.fileName,
    };
  }
}
