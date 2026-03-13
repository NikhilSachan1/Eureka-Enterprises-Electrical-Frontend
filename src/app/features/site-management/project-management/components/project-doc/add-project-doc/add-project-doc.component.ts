import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ADD_PROJECT_DOC_FORM_CONFIG,
  DOC_ENTRY_ROW_FIELD_CONFIG,
  DOC_TYPES_FIELD_CONFIG,
} from '@features/site-management/project-management/config/form/add-project-doc.config';
import { ProjectDocService } from '@features/site-management/project-management/services/project-doc.service';
import type { ISiteDocumentAddFormDto } from '@features/site-management/project-management/types/project.dto';
import { FormBase } from '@shared/base/form.base';
import {
  InputFieldConfigService,
  RouterNavigationService,
} from '@shared/services';
import { concatMap, finalize, of, toArray } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  EDataType,
  IInputFieldsConfig,
  IPageHeaderConfig,
} from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { transformDateFormat } from '@shared/utility';

@Component({
  selector: 'app-add-project-doc',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-project-doc.component.html',
  styleUrl: './add-project-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProjectDocComponent extends FormBase implements OnInit {
  private readonly projectDocService = inject(ProjectDocService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  protected formGroup!: FormGroup;
  protected documentEntriesFormArray!: FormArray;

  protected documentTypesFieldConfig!: IInputFieldsConfig;
  protected totalAmountFieldConfig!: IInputFieldsConfig;
  protected documentDateFieldConfig!: IInputFieldsConfig;
  protected documentNumberFieldConfig!: IInputFieldsConfig;
  protected attachmentFieldConfig!: IInputFieldsConfig;

  /** Bump on submit so nested inputs re-check validation & show errors (red border + message) */
  protected validationTrigger = signal(0);

  protected pageHeaderConfig: Partial<IPageHeaderConfig> = {
    title: 'Add Documents',
    subtitle: 'Select document types and fill details',
  };

  protected readonly formConfig = ADD_PROJECT_DOC_FORM_CONFIG;

  ngOnInit(): void {
    this.documentTypesFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.MULTI_SELECT,
        DOC_TYPES_FIELD_CONFIG
      );
    this.totalAmountFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.NUMBER,
        DOC_ENTRY_ROW_FIELD_CONFIG.totalAmount
      );
    this.documentDateFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.DATE,
        DOC_ENTRY_ROW_FIELD_CONFIG.documentDate
      );
    this.documentNumberFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.TEXT,
        DOC_ENTRY_ROW_FIELD_CONFIG.documentNumber
      );
    this.attachmentFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.ATTACHMENTS,
        DOC_ENTRY_ROW_FIELD_CONFIG.attachment
      );

    this.documentEntriesFormArray = this.fb.array<FormGroup>([]);
    this.formGroup = this.fb.group({
      documentTypes: this.fb.control<string[]>([], Validators.required),
      documentEntries: this.documentEntriesFormArray,
    });

    this.form = this.formService.wrapFormGroup(this.formGroup);

    this.formGroup
      .get('documentTypes')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selected: string[]) => {
        this.syncDocEntries(selected ?? []);
      });
  }

  private syncDocEntries(selectedTypes: string[]): void {
    const arr = this.documentEntriesFormArray;
    const existing = new Map<string, FormGroup>();

    for (let i = 0; i < arr.length; i++) {
      const g = arr.at(i) as FormGroup;
      const docType = g.get('_docType')?.value as string;
      if (docType) {
        existing.set(docType, g);
      }
    }

    arr.clear();
    selectedTypes.forEach(docType => {
      const prev = existing.get(docType);
      if (prev) {
        arr.push(prev);
      } else {
        arr.push(this.createDocEntryRow(docType));
      }
    });
  }

  private createDocEntryRow(docType: string): FormGroup {
    return this.fb.group({
      _docType: [docType],
      totalAmount: [null, Validators.required],
      documentDate: [null, Validators.required],
      documentNumber: ['', Validators.required],
      attachment: [[]], // Optional
    });
  }

  protected getDocEntryGroup(index: number): FormGroup {
    return this.documentEntriesFormArray.at(index) as FormGroup;
  }

  protected getDocTypeLabel(docType: string): string {
    const labels: Record<string, string> = {
      PO: 'PO',
      INVOICE: 'Invoice',
      CONTRACT: 'Contract',
      WORK_ORDER: 'Work Order',
      COMPLETION_CERTIFICATE: 'Completion Certificate',
      OTHER: 'Other',
    };
    return labels[docType] ?? docType;
  }

  protected override handleSubmit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      this.notificationService.error('Project ID is required');
      return;
    }

    this.validationTrigger.update(v => v + 1);
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const docPayloads = this.prepareDocumentPayloads(projectId);
    this.executeSequentialUploads(docPayloads);
  }

  private prepareDocumentPayloads(siteId: string): ISiteDocumentAddFormDto[] {
    const payloads: ISiteDocumentAddFormDto[] = [];

    const entries = this.documentEntriesFormArray;
    for (let i = 0; i < entries.length; i++) {
      const g = entries.at(i) as FormGroup;
      const docType = g.get('_docType')?.value as string;
      const totalAmount = g.get('totalAmount')?.value as number;
      const docDate = g.get('documentDate')?.value as Date;
      const documentDateStr = docDate ? transformDateFormat(docDate) : '';

      const payload: ISiteDocumentAddFormDto = {
        siteId,
        documentType: docType,
        totalAmount: totalAmount ?? 0,
        documentDate: documentDateStr,
        documentNumber: (g.get('documentNumber')?.value as string) ?? '',
      };

      const files = g.get('attachment')?.value as File[] | undefined;
      if (Array.isArray(files) && files.length > 0) {
        payload.siteDocumentFiles = files;
      }

      payloads.push(payload);
    }

    return payloads;
  }

  private executeSequentialUploads(payloads: ISiteDocumentAddFormDto[]): void {
    if (payloads.length === 0) {
      return;
    }

    this.loadingService.show({
      title: 'Adding Documents',
      message: 'Please wait...',
    });
    this.formGroup.disable();

    of(...payloads)
      .pipe(
        concatMap(payload => this.projectDocService.addDocument(payload)),
        toArray(),
        finalize(() => {
          this.isSubmitting.set(false);
          this.formGroup.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Documents added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.PROJECT,
            ROUTES.SITE.PROJECT.ANALYSIS,
            this.activatedRoute.snapshot.params['projectId'],
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add documents');
        },
      });
  }

  protected onReset(): void {
    this.formGroup.reset({
      documentTypes: [],
      documentEntries: [],
    });
    this.documentEntriesFormArray.clear();
  }
}
