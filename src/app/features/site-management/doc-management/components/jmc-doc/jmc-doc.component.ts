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
  IJmcDocAddFormDto,
  IJmcDocAddResponseDto,
  IJmcDocAddUIFormDto,
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
import { JMC_DOC_FORM_CONFIG } from '../../config';
import { EDocType } from '../../types/doc.enum';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DocRefChainComponent } from '../doc-ref-chain/doc-ref-chain.component';

@Component({
  selector: 'app-jmc-doc',
  imports: [InputFieldComponent, ReactiveFormsModule, DocRefChainComponent],
  templateUrl: './jmc-doc.component.html',
  styleUrl: './jmc-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JmcDocComponent
  extends FormBase<IJmcDocAddUIFormDto>
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
      .getDocNumberOptions(EDocType.PO, this.docContext(), EDocType.JMC)
      .then(poOptions => {
        this.form = this.formService.createForm<IJmcDocAddUIFormDto>(
          this.buildFormConfig(poOptions),
          { destroyRef: this.destroyRef }
        );
        this.prefillIfEditing();
        this.form.formGroup
          .get('poNumber')
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
      poNumber: rec.docReference ?? undefined,
      jmcNumber: rec.documentNumber,
      jmcDate: rec.documentDate ? new Date(rec.documentDate) : undefined,
      jmcRemark: rec.remark ?? undefined,
    } as Partial<IJmcDocAddUIFormDto>);
  }

  private prepareFormData(): IJmcDocAddFormDto {
    return { ...this.form.getData(), docContext: this.docContext() };
  }

  private buildFormConfig(
    poOptions: IOptionDropdown[]
  ): IFormConfig<IJmcDocAddUIFormDto> {
    return {
      ...JMC_DOC_FORM_CONFIG,
      fields: {
        ...JMC_DOC_FORM_CONFIG.fields,
        poNumber: {
          ...JMC_DOC_FORM_CONFIG.fields.poNumber,
          selectConfig: { optionsDropdown: poOptions },
        },
      },
    };
  }

  private executeDocAction(formData: IJmcDocAddFormDto): void {
    this.loadingService.show({
      title: 'Adding JMC Document',
      message: "We're adding the JMC document. This will just take a moment.",
    });
    this.form.disable();
    this.docService
      .addJmcDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IJmcDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private executeDocActionIndexedDb(formData: IJmcDocAddFormDto): void {
    const existing = this.editRecord();
    const action = existing
      ? this.docIndexedDbService.updateJmcDoc(existing, formData)
      : this.docIndexedDbService.addJmcDoc(formData);

    this.loadingService.show({
      title: existing ? 'Updating JMC Document' : 'Adding JMC Document',
      message: 'Please wait...',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'JMC document updated successfully'
            : 'JMC document saved successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch(error => {
        this.logger.error('JMC doc IndexedDB operation failed', error);
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
