import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { AppConfigurationService } from '@shared/services';
import { ICONS } from '@shared/constants';
import { EBankDetailsDisplayMode, IBankDetailsCellValue } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-bank-details-cell',
  templateUrl: './bank-details-cell.component.html',
  styleUrl: './bank-details-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankDetailsCellComponent {
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly ICONS = ICONS;
  protected readonly EBankDetailsDisplayMode = EBankDetailsDisplayMode;

  bankDetails = input<IBankDetailsCellValue | null>(null);
  displayMode = input<EBankDetailsDisplayMode>(EBankDetailsDisplayMode.DEFAULT);

  protected readonly hasBankDetails = computed(() => {
    const bank = this.bankDetails();

    if (!bank) {
      return false;
    }

    if (this.displayMode() === EBankDetailsDisplayMode.COMPACT) {
      return (
        (this.mappedBankName() ?? this.accountNumber() ?? this.branchName()) !==
        null
      );
    }

    return (
      (this.normalizeValue(bank.bankHolderName) ??
        this.normalizeValue(bank.bankName) ??
        this.normalizeValue(bank.accountNumber) ??
        this.normalizeValue(bank.ifscCode) ??
        this.normalizeValue(bank.branchName)) !== null
    );
  });

  protected readonly mappedBankName = computed(() => {
    const bankName = this.normalizeValue(this.bankDetails()?.bankName);
    if (!bankName) {
      return null;
    }

    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.bankNames(),
      bankName
    );
  });

  protected readonly primaryLabel = computed(() => {
    const bank = this.bankDetails();
    if (!bank) {
      return null;
    }

    return this.normalizeValue(bank.bankHolderName) ?? this.mappedBankName();
  });

  protected readonly secondaryLabel = computed(() => {
    const bank = this.bankDetails();
    if (!bank?.bankHolderName || !bank.bankName) {
      return null;
    }

    return this.mappedBankName();
  });

  protected readonly branchName = computed(
    () => this.normalizeValue(this.bankDetails()?.branchName) ?? null
  );

  protected readonly accountNumber = computed(
    () => this.normalizeValue(this.bankDetails()?.accountNumber) ?? null
  );

  protected readonly ifscCode = computed(
    () => this.normalizeValue(this.bankDetails()?.ifscCode) ?? null
  );

  /** Tile mode: account number in groups of four so it reads back easily. */
  protected readonly groupedAccountNumber = computed(() => {
    const account = this.accountNumber();

    return account
      ? account.replace(/\s+/g, '').replace(/(.{4})(?=.)/g, '$1 ')
      : null;
  });

  /** Tile mode: bank (when the holder leads) and branch on one line. */
  protected readonly tileMetaLine = computed(() => {
    const parts = [this.secondaryLabel(), this.branchName()].filter(
      (part): part is string => !!part
    );

    return parts.length ? parts.join(' · ') : null;
  });

  protected readonly copiedField = signal<'account' | 'ifsc' | null>(null);
  private copiedResetTimer?: ReturnType<typeof setTimeout>;

  /** Copies the raw value (no grouping spaces) and briefly shows a tick. */
  protected async copyValue(
    field: 'account' | 'ifsc',
    value: string | null
  ): Promise<void> {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value.replace(/\s+/g, ''));
    } catch {
      return;
    }

    this.copiedField.set(field);
    clearTimeout(this.copiedResetTimer);
    this.copiedResetTimer = setTimeout(() => this.copiedField.set(null), 1500);
  }

  private normalizeValue(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    if (!normalized) {
      return null;
    }
    return normalized;
  }
}
