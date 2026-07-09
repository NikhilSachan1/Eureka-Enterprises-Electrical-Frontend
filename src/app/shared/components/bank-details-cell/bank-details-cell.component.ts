import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AppConfigurationService } from '@shared/services';
import { ICONS } from '@shared/constants';
import { IBankDetailsCellValue } from '@shared/types/bank-details/bank-details.interface';
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

  bankDetails = input<IBankDetailsCellValue | null>(null);

  protected readonly hasBankDetails = computed(() => {
    const bank = this.bankDetails();

    if (!bank) {
      return false;
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

  private normalizeValue(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    if (!normalized) {
      return null;
    }
    return normalized;
  }
}
