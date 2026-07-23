import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
} from '@shared/types';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

import { EDIT_JMC_FORM_CONFIG } from '../../config';
import { JmcService } from '../../services/jmc.service';
import {
  IEditJmcFormDto,
  IEditJmcResponseDto,
  IEditJmcUIFormDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import {
  applyProjectDateRangeFromSite,
  IProjectSiteDateRange,
  parseProjectDateOnly,
} from '@features/site-management/project-management/utility/project-overview-date.util';

@Component({
  selector: 'app-edit-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-jmc.component.html',
  styleUrl: './edit-jmc.component.scss',
})
export class EditJmcComponent
  extends FormBase<IEditJmcUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly jmcService = inject(JmcService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IJmcGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly isSystemGenerated = computed(
    () => this.selectedRecord()[0]?.isSystemGenerated === true
  );

  ngOnInit(): void {
    const rows = this.selectedRecord();
    const record = rows?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit JMC: selected record was not provided');
      return;
    }

    this.form = this.formService.createForm<IEditJmcUIFormDto>(
      EDIT_JMC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          isSystemGenerated: this.isSystemGenerated(),
        },
        defaultValues: {
          projectName: record.siteId,
          poNumber: record.po.poNumber,
          jmcNumber: record.jmcNumber,
          jmcDate: parseProjectDateOnly(record.jmcDate),
          jmcAttachment: [],
          remarks: record.remarks ?? null,
          ...(this.isSystemGenerated() && record.items?.length
            ? {
                items: record.items.map(item => ({
                  itemName: item.itemName,
                  unit: item.unit,
                  quantity: Number(item.quantity),
                })),
              }
            : {}),
        },
      }
    );

    this.seedPoOption(record.po.poNumber);

    applyProjectDateRangeFromSite(
      this.form,
      'jmcDate',
      EDIT_JMC_FORM_CONFIG.fields.jmcDate.dateConfig,
      record.site as IProjectSiteDateRange
    );

    if (record.fileKey) {
      this.loadPrefillAttachmentFromKey(record.fileKey);
    }
  }

  private seedPoOption(poNumber: string): void {
    const base = this.form.fieldConfigs.poNumber;
    this.form.fieldConfigs.poNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: [
          {
            label: poNumber,
            value: poNumber,
          },
        ],
      },
    } as IInputFieldsConfig;
  }

  private loadPrefillAttachmentFromKey(fileKey: string): void {
    this.loadingService.show({
      title: 'Loading JMC data',
      message: 'Fetching the JMC data. Please wait…',
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
          this.form.patch({ jmcAttachment: files });
        },
        error: error => {
          this.logger.error('Failed to prefetch JMC attachment', error);
          this.notificationService.error(
            'Could not load the attachment. You can upload a new file.'
          );
        },
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
    this.executeEditJmcAction(record.id);
  }

  private executeEditJmcAction(jmcId: string): void {
    const isSystemGenerated = this.isSystemGenerated();

    this.loadingService.show({
      title: 'Updating JMC',
      message:
        'Please wait while we update the JMC. This will just take a moment.',
    });
    this.form.disable();

    const submit$ = isSystemGenerated
      ? this.jmcService.editJmc(this.prepareFormData(), jmcId)
      : this.attachmentsService
          .uploadFinancialDocument(this.form.getFieldData('jmcAttachment')[0])
          .pipe(
            switchMap(attachmentResponse =>
              this.jmcService.editJmc(
                this.prepareFormData(attachmentResponse),
                jmcId
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
        next: (response: IEditJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit JMC', error);
          this.notificationService.error(
            'Could not update the JMC. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto | null = null
  ): IEditJmcFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['jmcAttachment'];
    delete (record as Record<string, unknown>)['poNumber'];
    delete (record as Record<string, unknown>)['projectName'];

    if (!this.isSystemGenerated()) {
      delete (record as Record<string, unknown>)['items'];
    }

    return {
      ...record,
      jmcFileKey: attachmentResponse?.fileKey ?? null,
      jmcFileName: attachmentResponse?.fileName ?? null,
    };
  }
}
