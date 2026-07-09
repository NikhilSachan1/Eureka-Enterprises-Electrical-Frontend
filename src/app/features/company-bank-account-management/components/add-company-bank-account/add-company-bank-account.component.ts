import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { CompanyBankAccountService } from '../../services/company-bank-account.service';
import { ADD_COMPANY_BANK_ACCOUNT_FORM_CONFIG } from '../../config';
import { ICompanyBankAccountAddFormDto } from '../../types/company-bank-account.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-add-company-bank-account',
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    InputFieldComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-company-bank-account.component.html',
  styleUrl: './add-company-bank-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCompanyBankAccountComponent
  extends FormBase<ICompanyBankAccountAddFormDto>
  implements OnInit
{
  private readonly companyBankAccountService = inject(
    CompanyBankAccountService
  );
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<ICompanyBankAccountAddFormDto>(
      ADD_COMPANY_BANK_ACCOUNT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  protected override handleSubmit(): void {
    const formData = this.form.getData();
    this.executeAddCompanyBankAccount(formData);
  }

  private executeAddCompanyBankAccount(
    formData: ICompanyBankAccountAddFormDto
  ): void {
    this.loadingService.show({
      title: 'Adding company bank account',
      message:
        "We're adding the company bank account. This will just take a moment.",
    });
    this.form.disable();

    this.companyBankAccountService
      .addCompanyBankAccount(formData)
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
          this.notificationService.error('Failed to add company bank account');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Company Bank Account',
      subtitle: 'Add a new company bank account',
    };
  }
}
