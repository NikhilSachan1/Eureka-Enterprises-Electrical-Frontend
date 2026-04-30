import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IDocGetBaseResponseDto,
  IReportDocAddFormDto,
  IReportDocAddResponseDto,
  IReportDocAddUIFormDto,
} from '../../types/doc.dto';
import {
  IDialogActionHandler,
  IFormConfig,
  IOptionDropdown,
} from '@shared/types';
import { DocService } from '../../services/doc.service';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../services/doc-indexed-db.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { REPORT_DOC_FORM_CONFIG } from '../../config';
import { EDocType } from '../../types/doc.enum';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DocRefChainComponent } from '../doc-ref-chain/doc-ref-chain.component';

@Component({
  selector: 'app-report-doc',
  imports: [InputFieldComponent, ReactiveFormsModule, DocRefChainComponent],
  templateUrl: './report-doc.component.html',
  styleUrl: './report-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDocComponent
  extends FormBase<IReportDocAddUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docService = inject(DocService);
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<'sales' | 'purchase'>();
  protected readonly editRecord = input<IDocIndexedDbRow | null>(null);

  protected get isEditMode(): boolean {
    return !!this.editRecord();
  }
  protected readonly selectedRefDocId = signal<string | null>(null);

  ngOnInit(): void {
    void this.docIndexedDbService
      .getDocNumberOptions(EDocType.JMC, this.docContext(), EDocType.REPORT)
      .then(jmcOptions => {
        this.form = this.formService.createForm<IReportDocAddUIFormDto>(
          this.buildFormConfig(jmcOptions),
          { destroyRef: this.destroyRef }
        );
        this.prefillIfEditing();
        this.form.formGroup
          .get('jmcNumber')
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(val => this.selectedRefDocId.set(val as string | null));
        const editRef = this.editRecord()?.docReference;
        if (editRef) {
          this.selectedRefDocId.set(editRef);
        }
        this.cdr.markForCheck();
      });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    // this.executeDocAction(formData);
    this.executeDocActionIndexedDb(formData);
  }

  private prefillIfEditing(): void {
    const rec = this.editRecord();
    if (!rec) {
      return;
    }
    this.form.patch({
      jmcNumber: rec.docReference ?? undefined,
      reportNumber: rec.documentNumber,
      reportDate: rec.documentDate ? new Date(rec.documentDate) : undefined,
      reportRemark: rec.remark ?? undefined,
    } as Partial<IReportDocAddUIFormDto>);
  }

  private prepareFormData(): IReportDocAddFormDto {
    return { ...this.form.getData(), docContext: this.docContext() };
  }

  private buildFormConfig(
    jmcOptions: IOptionDropdown[]
  ): IFormConfig<IReportDocAddUIFormDto> {
    return {
      ...REPORT_DOC_FORM_CONFIG,
      fields: {
        ...REPORT_DOC_FORM_CONFIG.fields,
        jmcNumber: {
          ...REPORT_DOC_FORM_CONFIG.fields.jmcNumber,
          selectConfig: { optionsDropdown: jmcOptions },
        },
      },
    };
  }

  private executeDocAction(formData: IReportDocAddFormDto): void {
    this.loadingService.show({
      title: 'Adding Report Document',
      message:
        "We're adding the Report document. This will just take a moment.",
    });
    this.form.disable();
    this.docService
      .addReportDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IReportDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private executeDocActionIndexedDb(formData: IReportDocAddFormDto): void {
    const existing = this.editRecord();
    const action = existing
      ? this.docIndexedDbService.updateReportDoc(existing, formData)
      : this.docIndexedDbService.addReportDoc(formData);

    this.loadingService.show({
      title: existing ? 'Updating Report Document' : 'Adding Report Document',
      message: 'Please wait...',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'Report document updated successfully'
            : 'Report document saved successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch(error => {
        this.logger.error('Report doc IndexedDB operation failed', error);
        this.notificationService.error(
          FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
        );
      })
      .finally(() => {
        this.loadingService.hide();
        this.isSubmitting.set(false);
        this.form.enable();
      });
  }
}
