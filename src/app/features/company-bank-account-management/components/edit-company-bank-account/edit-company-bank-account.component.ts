import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import { IPageHeaderConfig } from '@shared/types';
import { CompanyBankAccountService } from '../../services/company-bank-account.service';
import { EDIT_COMPANY_BANK_ACCOUNT_FORM_CONFIG } from '../../config';
import {
  ICompanyBankAccountEditFormDto,
  ICompanyBankAccountGetBaseResponseDto,
} from '../../types/company-bank-account.dto';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-edit-company-bank-account',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-company-bank-account.component.html',
  styleUrl: './edit-company-bank-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCompanyBankAccountComponent
  extends FormBase<ICompanyBankAccountEditFormDto>
  implements OnInit
{
  private readonly companyBankAccountService = inject(
    CompanyBankAccountService
  );
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialCompanyBankAccountData =
    signal<ICompanyBankAccountEditFormDto | null>(null);

  ngOnInit(): void {
    this.loadCompanyBankAccountDataFromRoute();

    this.form = this.formService.createForm(
      EDIT_COMPANY_BANK_ACCOUNT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialCompanyBankAccountData(),
      }
    );
  }

  private loadCompanyBankAccountDataFromRoute(): void {
    const routeStateData =
      this.routerNavigationService.getRouterStateData<ICompanyBankAccountGetBaseResponseDto>(
        'companyBankAccountData'
      );

    if (!routeStateData) {
      this.logger.logUserAction('No company bank account data found in route');
      void this.routerNavigationService.navigateToRoute([
        ROUTE_BASE_PATHS.COMPANY_BANK_ACCOUNT,
        ROUTES.COMPANY_BANK_ACCOUNT.LIST,
      ]);
      return;
    }

    this.initialCompanyBankAccountData.set(
      this.preparePrefilledFormData(routeStateData)
    );
  }

  private preparePrefilledFormData(
    routeStateData: ICompanyBankAccountGetBaseResponseDto
  ): ICompanyBankAccountEditFormDto {
    const { bankName, accountHolderName, accountNumber, ifscCode, branchName } =
      routeStateData;

    return {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName: branchName?.trim() ?? '',
    };
  }

  protected override handleSubmit(): void {
    const companyBankAccountId = this.activatedRoute.snapshot.params[
      'companyBankAccountId'
    ] as string;
    if (!companyBankAccountId) {
      return;
    }

    const formData = this.form.getData();
    this.executeEditCompanyBankAccount(formData, companyBankAccountId);
  }

  private executeEditCompanyBankAccount(
    formData: ICompanyBankAccountEditFormDto,
    companyBankAccountId: string
  ): void {
    this.loadingService.show({
      title: 'Update Company Bank Account',
      message:
        "We're updating the company bank account. This will just take a moment.",
    });
    this.form.disable();

    this.companyBankAccountService
      .editCompanyBankAccount(formData, companyBankAccountId)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.notificationService.success(response.message);
          this.appConfigurationService.refreshCompanyBankAccountDropdowns();
          void this.routerNavigationService.navigateToRoute([
            ROUTE_BASE_PATHS.COMPANY_BANK_ACCOUNT,
            ROUTES.COMPANY_BANK_ACCOUNT.LIST,
          ]);
        },
        error: () => {
          this.notificationService.error(
            'Failed to update company bank account'
          );
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialCompanyBankAccountData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Company Bank Account',
      subtitle: 'Update company bank account details',
    };
  }
}
