import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { ICompanyAddFormDto } from '../../types/company.dto';
import { CompanyService } from '../../services/company.service';
import { RouterNavigationService } from '@shared/services';
import { ADD_COMPANY_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { ADD_COMPANY_PREFILLED_DATA } from '@shared/mock-data/add-company.mock-data';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-add-company',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCompanyComponent
  extends FormBase<ICompanyAddFormDto>
  implements OnInit
{
  private readonly companyService = inject(CompanyService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<ICompanyAddFormDto>(
      ADD_COMPANY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_COMPANY_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddCompany(formData);
  }

  private prepareFormData(): ICompanyAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddCompany(formData: ICompanyAddFormDto): void {
    this.loadingService.show({
      title: 'Add Company',
      message: 'Please wait while we add company...',
    });
    this.form.disable();

    this.companyService
      .addCompany(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Company added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.COMPANY,
            ROUTES.SITE.COMPANY.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add company');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Company',
      subtitle: 'Add a new company',
    };
  }
}
