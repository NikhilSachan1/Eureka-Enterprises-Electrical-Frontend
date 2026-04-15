import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  ICompanyDetailGetResponseDto,
  ICompanyEditFormDto,
} from '../../types/company.dto';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { CompanyService } from '../../services/company.service';
import { EDIT_COMPANY_FORM_CONFIG } from '../../config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-company',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCompanyComponent
  extends FormBase<ICompanyEditFormDto>
  implements OnInit
{
  private readonly companyService = inject(CompanyService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialCompanyData = signal<ICompanyEditFormDto | null>(
    null
  );

  ngOnInit(): void {
    this.loadCompanyDataFromRoute();

    this.form = this.formService.createForm<ICompanyEditFormDto>(
      EDIT_COMPANY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialCompanyData(),
      }
    );
  }

  private loadCompanyDataFromRoute(): void {
    const companyDetailFromResolver = this.activatedRoute.snapshot.data[
      'companyDetail'
    ] as ICompanyDetailGetResponseDto;

    if (!companyDetailFromResolver) {
      this.logger.logUserAction('No company data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.COMPANY,
        ROUTES.SITE.COMPANY.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledCompanyData = this.preparePrefilledFormData(
      companyDetailFromResolver
    );
    this.initialCompanyData.set(prefilledCompanyData);
  }

  private preparePrefilledFormData(
    companyDetailFromResolver: ICompanyDetailGetResponseDto
  ): ICompanyEditFormDto {
    const {
      name,
      contactNumber,
      email,
      gstNumber,
      blockNumber,
      streetName,
      landmark,
      state,
      city,
      pincode,
      parentCompanyId,
    } = companyDetailFromResolver;

    return {
      companyName: name,
      contactNumber: Number(contactNumber),
      emailAddress: email,
      companyGSTNumber: gstNumber,
      blockNumber,
      streetName,
      landmark,
      state,
      city,
      pincode: Number(pincode),
      parentCompanyName: parentCompanyId,
    };
  }

  protected override handleSubmit(): void {
    const companyId = this.activatedRoute.snapshot.params[
      'companyId'
    ] as string;
    if (!companyId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditCompany(formData, companyId);
  }

  private prepareFormData(): ICompanyEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditCompany(
    formData: ICompanyEditFormDto,
    companyId: string
  ): void {
    this.loadingService.show({
      title: 'Edit Company',
      message: 'Please wait while we edit company...',
    });
    this.form.disable();

    this.companyService
      .editCompany(formData, companyId)
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
          this.notificationService.success('Company updated successfully');
          this.appConfigurationService.refreshCompanyDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.COMPANY,
            ROUTES.SITE.COMPANY.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update company');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialCompanyData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Company',
      subtitle: 'Edit a company',
    };
  }
}
