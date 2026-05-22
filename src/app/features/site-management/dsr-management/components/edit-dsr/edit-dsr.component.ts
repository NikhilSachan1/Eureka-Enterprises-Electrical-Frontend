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
import { EDIT_DSR_FORM_CONFIG } from '@features/site-management/dsr-management/config';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  IDsrEditFormDto,
  IDsrEditResponseDto,
  IDsrEditUIFormDto,
  IDsrGetBaseResponseDto,
} from '@features/site-management/dsr-management/types/dsr.dto';
import { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  AppConfigurationService,
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { IDialogActionHandler, ITrackedFields } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';

@Component({
  selector: 'app-edit-dsr',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-dsr.component.html',
  styleUrl: './edit-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDsrComponent
  extends FormBase<IDsrEditUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly dsrService = inject(DsrService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );

  private trackedEditDsrFields!: ITrackedFields<IDsrEditUIFormDto>;
  private isInitialEngineerLoad = true;

  protected readonly selectedRecord =
    input.required<IDsrGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedEditDsrFields?.reportedEngineerName) {
        const engineerName = this.trackedEditDsrFields.reportedEngineerName();
        if (engineerName && typeof engineerName === 'string') {
          if (this.isInitialEngineerLoad) {
            this.isInitialEngineerLoad = false;
            return;
          }
          this.prefillReportedEngineerContact(engineerName);
        }
      }
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord()[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit DSR: selected record was not provided');
      return;
    }

    const prefilledDsrData = this.preparePrefilledFormData(record);

    this.form = this.formService.createForm<IDsrEditUIFormDto>(
      EDIT_DSR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: prefilledDsrData,
      }
    );

    this.trackedEditDsrFields =
      this.formService.trackMultipleFieldChanges<IDsrEditUIFormDto>(
        this.form.formGroup,
        ['reportedEngineerName'],
        this.destroyRef
      );

    this.loadPrefillAttachments(record.documentKeys);
    this.projectWorkspaceContext.patchDateField(
      this.form.fieldConfigs,
      'statusDate',
      this.changeDetectorRef
    );
  }

  private preparePrefilledFormData(
    record: IDsrGetBaseResponseDto
  ): IDsrEditUIFormDto {
    return {
      projectName: record.siteId,
      statusDate: new Date(record.reportDate),
      note: record.workDescription ?? record.remarks ?? '',
      workDone: record.workTypes,
      reportedEngineerName: record.reportingEngineerName,
      reportedEngineerContact: record.reportingEngineerContact
        ? Number(record.reportingEngineerContact)
        : null,
      dsrAttachments: [],
    };
  }

  private prefillReportedEngineerContact(engineerName: string): void {
    const employee = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.employeeList(),
      engineerName,
      'label',
      'data'
    ) as IEmployeeGetBaseResponseDto | string;

    if (!employee || typeof employee !== 'object' || !employee.contactNumber) {
      return;
    }

    this.form.patch({
      reportedEngineerContact: Number(employee.contactNumber),
    });
  }

  private loadPrefillAttachments(documentKeys: string[]): void {
    if (!documentKeys.length) {
      return;
    }

    this.loadingService.show({
      title: 'Loading DSR data',
      message: 'Fetching DSR attachments. Please wait…',
    });

    this.attachmentsService
      .loadFilesFromKeys(documentKeys)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: files => {
          this.form.patch({ dsrAttachments: files });
        },
        error: error => {
          this.logger.error('Failed to prefetch DSR attachments', error);
          this.notificationService.error(
            'Could not load attachments. You can upload new files.'
          );
        },
      });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const record = this.selectedRecord()[0];
    if (!record.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    this.executeEditDsr(this.prepareFormData(), record.id);
  }

  private prepareFormData(): IDsrEditFormDto {
    const record = { ...this.form.getData() };
    delete (record as Record<string, unknown>)['projectName'];
    return record;
  }

  private executeEditDsr(formData: IDsrEditFormDto, dsrId: string): void {
    this.loadingService.show({
      title: 'Updating DSR',
      message:
        'Please wait while we update the DSR. This will just take a moment.',
    });
    this.form.disable();

    this.dsrService
      .editDsr(formData, dsrId)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrEditResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to update DSR', error);
          this.notificationService.error('Failed to update DSR.');
        },
      });
  }
}
