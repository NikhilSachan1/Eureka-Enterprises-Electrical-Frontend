import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';

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

import { ADD_JMC_FORM_CONFIG } from '../../config';
import { JmcService } from '../../services/jmc.service';
import {
  IAddJmcFormDto,
  IAddJmcResponseDto,
  IAddJmcUIFormDto,
} from '../../types/jmc.dto';
import { PoService } from '@features/site-management/doc-management/sub-features/po-management/services/po.service';
import {
  IPoDropdownGetRequestDto,
  IPoDropdownRecordDto,
} from '@features/site-management/doc-management/sub-features/po-management/types/po.dto';

@Component({
  selector: 'app-add-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-jmc.component.html',
  styleUrl: './add-jmc.component.scss',
})
export class AddJmcComponent
  extends FormBase<IAddJmcUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly jmcService = inject(JmcService);
  private readonly poService = inject(PoService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedJmcUiFields!: ITrackedFields<IAddJmcUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedJmcUiFields && this.trackedJmcUiFields.projectName) {
        const siteId = this.trackedJmcUiFields.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadPoOptions(siteId);
        }
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddJmcUIFormDto>(
      ADD_JMC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    const trackedFields: (keyof IAddJmcUIFormDto)[] = ['projectName'];

    this.trackedJmcUiFields =
      this.formService.trackMultipleFieldChanges<IAddJmcUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  private loadPoOptions(siteId: string): void {
    this.applyPoOptions([], true);

    const paramData = this.prepareParamDataForPoDetail(siteId);

    this.poService
      .getPoDropdown(paramData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const poOptionDropdown = this.mapPoRecordToOption(response.records);
          this.applyPoOptions(poOptionDropdown, false);
        },
        error: error => {
          this.logger.error('Failed to load PO dropdown', error);
          this.notificationService.error(
            'Could not load the PO list for this project. Please try again.'
          );
          this.applyPoOptions([], false);
        },
      });
  }

  private prepareParamDataForPoDetail(
    siteId: string
  ): IPoDropdownGetRequestDto {
    return {
      projectName: siteId,
      docType: this.docContext(),
    };
  }

  private mapPoRecordToOption(
    records: IPoDropdownRecordDto[]
  ): IOptionDropdown[] {
    return records.map(record => ({
      label: record.label,
      value: record.id,
      disabled: !record.eligible,
      disabledReason: record.reason ?? undefined,
    }));
  }

  private applyPoOptions(options: IOptionDropdown[], loading: boolean): void {
    const base = this.form.fieldConfigs.poNumber;
    this.form.fieldConfigs.poNumber = {
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
    this.executeAddJmcAction();
  }

  private executeAddJmcAction(): void {
    const file = this.form.getFieldData('jmcAttachment');

    this.loadingService.show({
      title: 'Adding JMC',
      message:
        "Please wait while we're adding the JMC. This will just take a moment.",
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.jmcService.addJmc(formData);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add JMC', error);
          this.notificationService.error(
            'Could not add the JMC. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IAddJmcFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['jmcAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
    return {
      ...record,
      jmcFileKey: attachmentResponse.fileKey,
      jmcFileName: attachmentResponse.fileName,
    };
  }
}
