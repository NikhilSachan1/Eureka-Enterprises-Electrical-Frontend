import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, finalize, map, of, switchMap } from 'rxjs';

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
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly selectedRecord =
    input.required<IJmcGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private isNoJmcTracked!: Signal<boolean | null | undefined>;

  /** Hidden when no JMC is selected; shown when unset (default) or a JMC exists. */
  protected readonly showJmcDetails = computed(() => !this.isNoJmcTracked());

  /** No JMC is only allowed on a supply-item PO. Unknown type keeps the old checkbox. */
  protected readonly showNoJmcOption = computed(() => {
    if (this.isSystemGenerated()) {
      return false;
    }

    const poType = this.selectedRecord()[0]?.po?.poType ?? null;
    if (poType == null) {
      return true;
    }

    return poType === 'SUPPLY_ITEM';
  });

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
          isNoJmc:
            !this.isSystemGenerated() &&
            !record.jmcNumber &&
            (record.po.poType == null || record.po.poType === 'SUPPLY_ITEM'),
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

    this.isNoJmcTracked = this.formService.trackFieldChanges(
      this.form.formGroup,
      'isNoJmc',
      this.destroyRef
    );

    applyProjectDateRangeFromSite(
      this.form,
      'jmcDate',
      EDIT_JMC_FORM_CONFIG.fields.jmcDate.dateConfig,
      record.site as IProjectSiteDateRange
    );

    if (record.fileKey) {
      this.loadPrefillAttachmentFromKey(record.fileKey);
    }

    if (this.isSystemGenerated()) {
      this.setupJmcItemNameTypeahead();
      queueMicrotask(() => this.changeDetectorRef.detectChanges());
    }
  }

  private setupJmcItemNameTypeahead(): void {
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
                return this.jmcService
                  .getJmcItemSuggestions(search ? { search } : {})
                  .pipe(
                    map(response =>
                      response.records.map(name => ({
                        label: name,
                        value: name,
                      }))
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
    const formData = this.form.getData();
    const isSystemGenerated = this.isSystemGenerated();
    const isNoJmc = Boolean(formData.isNoJmc);
    const file = formData.jmcAttachment as File[] | undefined;

    this.loadingService.show({
      title: 'Updating JMC',
      message:
        'Please wait while we update the JMC. This will just take a moment.',
    });
    this.form.disable();

    const submit$ = defer(() =>
      !isSystemGenerated && !isNoJmc && file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    ).pipe(
      switchMap(attachmentResponse =>
        this.jmcService.editJmc(
          this.prepareFormData(formData, attachmentResponse),
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
    formData: IEditJmcUIFormDto,
    attachmentResponse: IFinancialFileUploadResponseDto | null
  ): IEditJmcFormDto {
    const isNoJmc = Boolean(formData.isNoJmc);
    const record = { ...formData };
    delete (record as Record<string, unknown>)['jmcAttachment'];
    delete (record as Record<string, unknown>)['poNumber'];
    delete (record as Record<string, unknown>)['projectName'];

    if (!this.isSystemGenerated() || isNoJmc) {
      delete (record as Record<string, unknown>)['items'];
    }

    return {
      ...record,
      jmcNumber: isNoJmc ? null : formData.jmcNumber,
      jmcFileKey: isNoJmc ? null : (attachmentResponse?.fileKey ?? null),
      jmcFileName: isNoJmc ? null : (attachmentResponse?.fileName ?? null),
    };
  }
}
