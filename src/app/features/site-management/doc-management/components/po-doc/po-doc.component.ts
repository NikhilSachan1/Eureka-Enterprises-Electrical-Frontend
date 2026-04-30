import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IDocGetBaseResponseDto,
  IPoDocAddFormDto,
  IPoDocAddResponseDto,
  IPoDocAddUIFormDto,
} from '../../types/doc.dto';
import { IDialogActionHandler, IFormConfig } from '@shared/types';
import { DocService } from '../../services/doc.service';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../services/doc-indexed-db.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { PO_DOC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-po-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './po-doc.component.html',
  styleUrl: './po-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoDocComponent
  extends FormBase<IPoDocAddUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docService = inject(DocService);
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input<'sales' | 'purchase'>('sales');
  protected readonly editRecord = input<IDocIndexedDbRow | null>(null);

  protected get isEditMode(): boolean {
    return !!this.editRecord();
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IPoDocAddUIFormDto>(
      this.getPoFormConfig(),
      { destroyRef: this.destroyRef }
    );
    this.prefillIfEditing();
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
    const partyId =
      this.docContext() === 'sales' ? rec.contractorName : rec.vendorName;
    this.form.patch({
      contractorName: partyId ?? undefined,
      poNumber: rec.documentNumber,
      poDate: rec.documentDate ? new Date(rec.documentDate) : undefined,
      poTaxableAmount: rec.taxableAmount ?? undefined,
      poGstAmount: rec.gstAmount ?? undefined,
      poTotalAmount: rec.totalAmount ?? undefined,
      poRemark: rec.remark ?? undefined,
    } as Partial<IPoDocAddUIFormDto>);
  }

  private prepareFormData(): IPoDocAddFormDto {
    const formData = this.form.getData();
    return { ...formData, docContext: this.docContext() };
  }

  private getPoFormConfig(): IFormConfig<IPoDocAddUIFormDto> {
    if (this.docContext() !== 'purchase') {
      return PO_DOC_FORM_CONFIG;
    }
    return {
      ...PO_DOC_FORM_CONFIG,
      fields: {
        ...PO_DOC_FORM_CONFIG.fields,
        contractorName: {
          ...PO_DOC_FORM_CONFIG.fields.contractorName,
          label: 'Vendor Name',
        },
      },
    };
  }

  private executeDocAction(formData: IPoDocAddFormDto): void {
    this.loadingService.show({
      title: 'Adding PO Document',
      message: "We're adding the PO document. This will just take a moment.",
    });
    this.form.disable();
    this.docService
      .addPoDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPoDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private executeDocActionIndexedDb(formData: IPoDocAddFormDto): void {
    const existing = this.editRecord();
    const action = existing
      ? this.docIndexedDbService.updatePoDoc(existing, formData)
      : this.docIndexedDbService.addPoDoc(formData);

    this.loadingService.show({
      title: existing ? 'Updating PO Document' : 'Adding PO Document',
      message: 'Please wait...',
    });
    this.form.disable();
    void action
      .then(() => {
        this.notificationService.success(
          existing
            ? 'PO document updated successfully'
            : 'PO document saved successfully'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch(error => {
        this.logger.error('PO doc IndexedDB operation failed', error);
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
