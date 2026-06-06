import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, finalize, of, switchMap } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
  IInputFieldsConfig,
  IOptionDropdown,
  ITrackedFields,
} from '@shared/types';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

import { ADD_REPORT_FORM_CONFIG } from '../../config';
import { ReportService } from '../../services/report.service';
import {
  IAddReportFormDto,
  IAddReportResponseDto,
  IAddReportUIFormDto,
} from '../../types/report.dto';
import { JmcService } from '@features/site-management/doc-management/sub-features/jmc-management/services/jmc.service';
import {
  IJmcDropdownGetRequestDto,
  IJmcDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/jmc-management/types/jmc.dto';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';

@Component({
  selector: 'app-add-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-report.component.html',
  styleUrl: './add-report.component.scss',
})
export class AddReportComponent
  extends FormBase<IAddReportUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly reportService = inject(ReportService);
  private readonly jmcService = inject(JmcService);
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedUiFields!: ITrackedFields<IAddReportUIFormDto>;
  private isNoReportTracked!: Signal<boolean | null | undefined>;

  /** Hidden when no report is selected; shown when unset (default) or report exists. */
  protected readonly showReportDetails = computed(
    () => !this.isNoReportTracked()
  );

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly projectName = input<string>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedUiFields && this.trackedUiFields.projectName) {
        const siteId = this.trackedUiFields.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadProjectDateRange(siteId);
          this.loadJmcOptions(siteId);
          return;
        }

        this.resetReportDateField();
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddReportUIFormDto>(
      ADD_REPORT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    const trackedFields: (keyof IAddReportUIFormDto)[] = ['projectName'];

    this.trackedUiFields =
      this.formService.trackMultipleFieldChanges<IAddReportUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );

    this.isNoReportTracked = this.formService.trackFieldChanges(
      this.form.formGroup,
      'isNoReport',
      this.destroyRef
    );
  }

  private loadProjectDateRange(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'reportDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          applyProjectDateRangeFromOverview(
            this.form,
            'reportDate',
            ADD_REPORT_FORM_CONFIG.fields.reportDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.resetReportDateField();
        },
      });
  }

  private resetReportDateField(): void {
    resetProjectDateField(
      this.form,
      'reportDate',
      ADD_REPORT_FORM_CONFIG.fields.reportDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private loadJmcOptions(siteId: string): void {
    this.applyJmcOptions([], true);

    const paramData = this.prepareParamDataForJmcDropdown(siteId);

    this.jmcService
      .getJmcDropdown(paramData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const opts = this.mapJmcRecordsToOption(response.records);
          this.applyJmcOptions(opts, false);
        },
        error: error => {
          this.logger.error('Failed to load JMC dropdown', error);
          this.notificationService.error(
            'Could not load the JMC list for this project. Please try again.'
          );
          this.applyJmcOptions([], false);
        },
      });
  }

  private prepareParamDataForJmcDropdown(
    siteId: string
  ): IJmcDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
      forDocument: 'report',
    };
  }

  private mapJmcRecordsToOption(
    records: IJmcDropdownRecordDto[]
  ): IOptionDropdown[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
    }));
  }

  private applyJmcOptions(options: IOptionDropdown[], loading: boolean): void {
    const base = this.form.fieldConfigs.jmcNumber;
    this.form.fieldConfigs.jmcNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: options,
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAddReportAction();
  }

  private executeAddReportAction(): void {
    const isNoReport = Boolean(this.form.getFieldData('isNoReport'));
    const file = this.form.getFieldData('reportAttachment') as
      | File[]
      | undefined;

    this.loadingService.show({
      title: 'Adding report',
      message:
        "Please wait while we're adding the report. This will just take a moment.",
    });
    this.form.disable();

    defer(() =>
      !isNoReport && file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.reportService.addReport(formData);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddReportResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add report', error);
          this.notificationService.error(
            'Could not add the report. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto | null
  ): IAddReportFormDto {
    const formData = this.form.getData();
    const isNoReport = Boolean(formData.isNoReport);
    const record = { ...formData };
    delete (record as Record<string, unknown>)['reportAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
    return {
      ...record,
      reportNumber: isNoReport ? null : record.reportNumber,
      reportFileKey: isNoReport ? null : (attachmentResponse?.fileKey ?? null),
      reportFileName: isNoReport
        ? null
        : (attachmentResponse?.fileName ?? null),
    };
  }
}
