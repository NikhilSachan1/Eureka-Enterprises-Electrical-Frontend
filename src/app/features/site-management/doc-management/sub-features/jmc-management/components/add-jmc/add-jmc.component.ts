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
import { finalize, map, switchMap } from 'rxjs';

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
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';

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
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedJmcUiFields!: ITrackedFields<IAddJmcUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();
  protected readonly projectName = input<string>();
  protected readonly isSystemGenerated = input(false);

  constructor() {
    super();
    effect(() => {
      if (this.trackedJmcUiFields && this.trackedJmcUiFields.projectName) {
        const siteId = this.trackedJmcUiFields.projectName();
        if (siteId && typeof siteId === 'string') {
          this.loadProjectDateRange(siteId);
          this.loadPoOptions(siteId);
          return;
        }

        this.resetJmcDateField();
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddJmcUIFormDto>(
      ADD_JMC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          isSystemGenerated: this.isSystemGenerated(),
        },
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    const trackedFields: (keyof IAddJmcUIFormDto)[] = ['projectName'];

    this.trackedJmcUiFields =
      this.formService.trackMultipleFieldChanges<IAddJmcUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );

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

  private loadProjectDateRange(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'jmcDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          applyProjectDateRangeFromOverview(
            this.form,
            'jmcDate',
            ADD_JMC_FORM_CONFIG.fields.jmcDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.resetJmcDateField();
        },
      });
  }

  private resetJmcDateField(): void {
    resetProjectDateField(
      this.form,
      'jmcDate',
      ADD_JMC_FORM_CONFIG.fields.jmcDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
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
    const isGenerate = this.isSystemGenerated();

    this.loadingService.show({
      title: isGenerate ? 'Generating JMC' : 'Adding JMC',
      message: isGenerate
        ? "Please wait while we're generating the JMC. This will just take a moment."
        : "Please wait while we're adding the JMC. This will just take a moment.",
    });
    this.form.disable();

    const submit$ = isGenerate
      ? this.jmcService.addJmc(this.prepareFormData())
      : this.attachmentsService
          .uploadFinancialDocument(this.form.getFieldData('jmcAttachment')[0])
          .pipe(
            switchMap(attachmentResponse =>
              this.jmcService.addJmc(this.prepareFormData(attachmentResponse))
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
        next: (response: IAddJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(
            isGenerate ? 'Failed to generate JMC' : 'Failed to add JMC',
            error
          );
          this.notificationService.error(
            isGenerate
              ? 'Could not generate the JMC. Please try again.'
              : 'Could not add the JMC. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto | null = null
  ): IAddJmcFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['jmcAttachment'];
    delete (record as Record<string, unknown>)['projectName'];
    return {
      ...record,
      jmcFileKey: attachmentResponse?.fileKey ?? null,
      jmcFileName: attachmentResponse?.fileName ?? null,
    };
  }
}
