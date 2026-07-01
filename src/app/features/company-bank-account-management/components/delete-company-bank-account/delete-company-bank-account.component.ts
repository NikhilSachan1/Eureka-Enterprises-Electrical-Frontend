import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import {
  ICompanyBankAccountDeleteResponseDto,
  ICompanyBankAccountGetBaseResponseDto,
} from '../../types/company-bank-account.dto';
import { CompanyBankAccountService } from '../../services/company-bank-account.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-delete-company-bank-account',
  imports: [],
  templateUrl: './delete-company-bank-account.component.html',
  styleUrl: './delete-company-bank-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteCompanyBankAccountComponent
  extends FormBase<Record<string, never>>
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

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete company bank account but was not provided'
      );
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const records = this.selectedRecord();
    if (!records.length) {
      return;
    }

    this.executeDeleteAction(records.map(record => record.id));
  }

  private executeDeleteAction(companyBankAccountIds: string[]): void {
    this.loadingService.show({
      title: 'Deleting Company Bank Account',
      message:
        "We're removing the company bank account. This will just take a moment.",
    });

    forkJoin(
      companyBankAccountIds.map(id =>
        this.companyBankAccountService.deleteCompanyBankAccount(id)
      )
    )
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (responses: ICompanyBankAccountDeleteResponseDto[]) => {
          const message =
            responses.length === 1
              ? responses[0].message
              : `${responses.length} company bank accounts deleted successfully.`;

          this.notificationService.success(message);
          this.appConfigurationService.refreshCompanyBankAccountDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: (error: unknown) => {
          this.logger.error('Failed to delete company bank account.', error);
          this.notificationService.error(
            'Failed to delete company bank account.'
          );
        },
      });
  }
}
