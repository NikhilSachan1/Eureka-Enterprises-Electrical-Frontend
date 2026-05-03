import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IDocGetBaseResponseDto,
  IGstPaymentReleaseDocAddFormDto,
  IGstPaymentReleaseDocAddUIFormDto,
} from '../../types/doc.dto';
import { IDialogActionHandler, IFormConfig } from '@shared/types';
import {
  GstPaymentReleaseDocAddRequestSchema,
  GstPaymentReleaseDocUpdateRequestSchema,
} from '../../schemas';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../services/doc-indexed-db.service';
import { ConfirmationDialogService } from '@shared/services';
import { GstPortalPaymentStorageService } from '@features/site-management/gst-compliance/services/gst-portal-payment-storage.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { GST_PAYMENT_RELEASE_DOC_FORM_FIELDS_CONFIG } from '../../config';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-gst-payment-release-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './gst-payment-release-doc.component.html',
  styleUrl: './gst-payment-release-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GstPaymentReleaseDocComponent
  extends FormBase<IGstPaymentReleaseDocAddUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly gstPortalPaymentStorage = inject(
    GstPortalPaymentStorageService
  );
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<'sales' | 'purchase'>();
  protected readonly editRecord = input<IDocIndexedDbRow | null>(null);
  /** When opening from GST screen, pass the suggested held-GST figure (plain amount). */
  protected readonly prefilledGstAmount = input<number | null>(null);
  /** e.g. "April 2026 — Party Name" — optional context for remark prefill. */
  protected readonly gstReleaseContextLabel = input<string | null>(null);
  /** Party bucket key (contractor id) — stored on doc row for sales / purchase context. */
  protected readonly prefilledPartyKey = input<string | null>(null);
  /** `YYYY-MM` when opening from GST screen — used to pick invoice headroom for booking. */
  protected readonly prefilledMonthKey = input<string | null>(null);
  /**
   * Purchase GST screen: verified bills in table order — used to mark per-bill govt GST remitted after save.
   */
  protected readonly gstReleaseAllocationOrder = input<
    { invoiceId: string; gstAmount: number }[] | null
  >(null);

  protected get isEditMode(): boolean {
    return !!this.editRecord();
  }

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required for GST payment release dialog'
      );
      return;
    }

    const defaults: Partial<IGstPaymentReleaseDocAddUIFormDto> = {};
    const pre = this.prefilledGstAmount();
    if (pre !== null && pre !== undefined && pre > 0) {
      defaults.gstReleaseAmount = pre;
    }

    this.form = this.formService.createForm<IGstPaymentReleaseDocAddUIFormDto>(
      this.buildFormConfig(),
      {
        destroyRef: this.destroyRef,
        defaultValues: defaults,
      }
    );
    this.afterFormInit();
  }

  private buildFormConfig(): IFormConfig<IGstPaymentReleaseDocAddUIFormDto> {
    const f = GST_PAYMENT_RELEASE_DOC_FORM_FIELDS_CONFIG;
    const purchase = this.docContext() === 'purchase';
    if (purchase) {
      return {
        fields: {
          gstReleaseUtr: {
            ...f.gstReleaseUtr,
            validators: [Validators.required],
          },
          gstReleaseDate: f.gstReleaseDate,
          gstReleaseAmount: { ...f.gstReleaseAmount },
          gstReleaseAttachments: f.gstReleaseAttachments,
          gstReleaseRemark: f.gstReleaseRemark,
        },
      };
    }
    return {
      fields: {
        gstReleaseUtr: { ...f.gstReleaseUtr, validators: [] },
        gstReleaseDate: f.gstReleaseDate,
        gstReleaseAmount: f.gstReleaseAmount,
        gstReleaseAttachments: f.gstReleaseAttachments,
        gstReleaseRemark: f.gstReleaseRemark,
      },
    };
  }

  private afterFormInit(): void {
    this.prefillIfEditing();
    this.applyContextRemarkPrefill();
    const amtCtrl = this.form.formGroup.get('gstReleaseAmount');
    const pre = this.prefilledGstAmount();
    if (
      this.docContext() === 'purchase' &&
      amtCtrl &&
      pre !== null &&
      pre !== undefined &&
      pre > 0
    ) {
      amtCtrl.disable({ emitEvent: false });
    }
  }

  /** Month + contractor line from GST screen (not used in edit mode). */
  private applyContextRemarkPrefill(): void {
    if (this.editRecord()) {
      return;
    }
    if (this.docContext() === 'purchase') {
      return;
    }
    const label = this.gstReleaseContextLabel()?.trim();
    if (!label) {
      return;
    }
    const current = this.form.formGroup.get('gstReleaseRemark')?.value as
      | string
      | null
      | undefined;
    if (current !== null && current !== undefined && String(current).trim()) {
      return;
    }
    this.form.patch({
      gstReleaseRemark: `Month / party: ${label}`,
    } as Partial<IGstPaymentReleaseDocAddUIFormDto>);
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeSave(formData);
  }

  private prefillIfEditing(): void {
    const rec = this.editRecord();
    if (!rec) {
      return;
    }
    const dateStr = rec.documentDate;
    const utrMatch = rec.remark?.match(/UTR:\s*(\S+)/i);
    const utr = utrMatch?.[1];
    const patch: Partial<IGstPaymentReleaseDocAddUIFormDto> = {
      gstReleaseAmount: rec.totalAmount ?? undefined,
      gstReleaseDate: dateStr ? new Date(`${dateStr}T12:00:00`) : undefined,
      gstReleaseRemark: rec.remark ?? undefined,
    };
    if (utr) {
      patch.gstReleaseUtr = utr;
    }
    this.form.patch(patch);
  }

  private prepareFormData(): IGstPaymentReleaseDocAddFormDto {
    const pk = this.resolvePartyKeyForSubmit();
    const mk = this.prefilledMonthKey()?.trim();
    const raw = this.normalizeGstReleaseRawForZod({
      ...this.form.getRawData(),
      docContext: this.docContext(),
      ...(pk ? { gstReleasePartyKey: pk } : {}),
      ...(mk ? { gstReleaseMonthKey: mk } : {}),
    });
    if (this.editRecord()) {
      return GstPaymentReleaseDocUpdateRequestSchema.parse(
        raw
      ) as IGstPaymentReleaseDocAddFormDto;
    }
    return GstPaymentReleaseDocAddRequestSchema.parse(raw);
  }

  /**
   * PrimeNG / reactive forms often use `null` for empty selects; Zod `.optional()` expects
   * `undefined`, not `null` — avoids "expected string, received null" etc.
   */
  private normalizeGstReleaseRawForZod(
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const allowed = new Set([
      'docContext',
      'gstReleaseAmount',
      'gstReleaseDate',
      'gstReleaseRemark',
      'gstReleaseAttachments',
      'gstReleasePartyKey',
      'gstReleaseMonthKey',
      'gstReleaseUtr',
    ]);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (allowed.has(k)) {
        if (v === null) {
          if (k === 'gstReleaseAttachments') {
            out[k] = [];
          }
        } else if (
          !(
            v === '' &&
            (k === 'gstReleaseUtr' ||
              k === 'gstReleasePartyKey' ||
              k === 'gstReleaseMonthKey')
          )
        ) {
          out[k] = v;
        }
      }
    }
    return out;
  }

  /** New row from GST screen, or existing row party on edit. */
  private resolvePartyKeyForSubmit(): string | undefined {
    const fromAdd = this.prefilledPartyKey()?.trim();
    if (fromAdd) {
      return fromAdd;
    }
    const rec = this.editRecord();
    if (!rec) {
      return undefined;
    }
    const raw =
      this.docContext() === 'sales'
        ? rec.contractorName?.trim()
        : rec.vendorName?.trim();
    return raw !== undefined && raw !== '' ? raw : undefined;
  }

  private executeSave(formData: IGstPaymentReleaseDocAddFormDto): void {
    const existing = this.editRecord();
    this.loadingService.show({
      title: existing
        ? 'Updating GST payment release'
        : 'Saving GST payment release',
      message: 'Please wait…',
    });
    this.form.disable();

    const action = existing
      ? this.docIndexedDbService.updateGstPaymentReleaseDoc(existing, formData)
      : this.docIndexedDbService.addGstPaymentReleaseDoc(formData);

    void action
      .then(() => {
        if (
          !existing &&
          formData.docContext === 'purchase' &&
          formData.gstReleaseAmount > 0
        ) {
          const order = this.gstReleaseAllocationOrder();
          const pk = formData.gstReleasePartyKey?.trim();
          const mk = formData.gstReleaseMonthKey?.trim();
          if (order?.length && pk && mk) {
            this.gstPortalPaymentStorage.applyPurchaseGstReleaseAllocation(
              mk,
              pk,
              formData.gstReleaseAmount,
              order
            );
          }
        }
        this.notificationService.success(
          existing
            ? 'GST payment release updated.'
            : formData.docContext === 'purchase'
              ? 'GST payment release saved — vendor payment advice generated.'
              : 'GST payment release saved.'
        );
        this.onSuccess()();
        this.confirmationDialogService.closeDialog();
      })
      .catch((error: unknown) => {
        this.logger.error('GST payment release save failed', error);
        const msg =
          error instanceof Error
            ? error.message
            : FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG;
        this.notificationService.error(msg);
      })
      .finally(() => {
        this.loadingService.hide();
        this.isSubmitting.set(false);
        this.form.enable();
        const amtCtrl = this.form.formGroup.get('gstReleaseAmount');
        const pre = this.prefilledGstAmount();
        if (
          this.docContext() === 'purchase' &&
          amtCtrl &&
          pre !== null &&
          pre !== undefined &&
          pre > 0
        ) {
          amtCtrl.disable({ emitEvent: false });
        }
        this.cdr.markForCheck();
      });
  }
}
