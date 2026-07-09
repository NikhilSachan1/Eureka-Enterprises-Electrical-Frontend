import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { CompanyBankAccountService } from '../../services/company-bank-account.service';
import {
  ICompanyBankAccountChangeStatusFormDto,
  ICompanyBankAccountChangeStatusResponseDto,
  ICompanyBankAccountGetBaseResponseDto,
} from '../../types/company-bank-account.dto';
import { ECompanyBankAccountStatus } from '../../types/company-bank-account.enum';
import { FORM_VALIDATION_MESSAGES, ICONS } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-change-status-company-bank-account',
  imports: [NgClass],
  templateUrl: './change-status-company-bank-account.component.html',
  styleUrl: './change-status-company-bank-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusCompanyBankAccountComponent
  extends FormBase<ICompanyBankAccountChangeStatusFormDto>
  implements OnInit
{
  private readonly companyBankAccountService = inject(
    CompanyBankAccountService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<ICompanyBankAccountGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly ALL_COMPANY_BANK_ACCOUNT_STATUS =
    ECompanyBankAccountStatus;
  protected readonly ICONS = ICONS;

  protected readonly currentStatus = computed(() => {
    const record = this.selectedRecord();
    return record?.[0]?.isActive
      ? this.ALL_COMPANY_BANK_ACCOUNT_STATUS.ACTIVE
      : this.ALL_COMPANY_BANK_ACCOUNT_STATUS.INACTIVE;
  });

  protected readonly newStatus = computed(() => {
    return this.currentStatus() === this.ALL_COMPANY_BANK_ACCOUNT_STATUS.ACTIVE
      ? this.ALL_COMPANY_BANK_ACCOUNT_STATUS.INACTIVE
      : this.ALL_COMPANY_BANK_ACCOUNT_STATUS.ACTIVE;
  });

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to change company bank account status but was not provided'
      );
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const { id: companyBankAccountId } = this.selectedRecord()[0];
    const formData = this.prepareFormData();
    this.executeChangeStatusAction(formData, companyBankAccountId);
  }

  private prepareFormData(): ICompanyBankAccountChangeStatusFormDto {
    return {
      isActive:
        this.newStatus() === this.ALL_COMPANY_BANK_ACCOUNT_STATUS.ACTIVE,
    };
  }

  private executeChangeStatusAction(
    formData: ICompanyBankAccountChangeStatusFormDto,
    companyBankAccountId: string
  ): void {
    this.loadingService.show({
      title: 'Changing Bank Account Status',
      message:
        "We're updating the bank account status. This will just take a moment.",
    });

    this.companyBankAccountService
      .changeCompanyBankAccountStatus(formData, companyBankAccountId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: ICompanyBankAccountChangeStatusResponseDto) => {
          this.notificationService.success(
            'Company bank account status changed successfully'
          );
          this.appConfigurationService.refreshCompanyBankAccountDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: (error: unknown) => {
          this.logger.error(
            'Failed to change company bank account status',
            error
          );
          this.notificationService.error(
            'Failed to change company bank account status'
          );
        },
      });
  }
}
