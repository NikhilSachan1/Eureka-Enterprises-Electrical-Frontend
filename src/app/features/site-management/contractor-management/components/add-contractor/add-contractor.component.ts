import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IContractorAddFormDto } from '../../types/contractor.dto';
import { ContractorService } from '../../services/contractor.service';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ADD_CONTRACTOR_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { ADD_CONTRACTOR_PREFILLED_DATA } from '@shared/mock-data/add-contractor.mock-data';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-contractor',
  imports: [
    ButtonComponent,
    InputFieldComponent,
    PageHeaderComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-contractor.component.html',
  styleUrl: './add-contractor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddContractorComponent
  extends FormBase<IContractorAddFormDto>
  implements OnInit
{
  private readonly contractorService = inject(ContractorService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IContractorAddFormDto>(
      ADD_CONTRACTOR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_CONTRACTOR_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddContractor(formData);
  }

  private prepareFormData(): IContractorAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddContractor(formData: IContractorAddFormDto): void {
    this.loadingService.show({
      title: 'Add Contractor',
      message: 'Please wait while we add contractor...',
    });
    this.form.disable();

    this.contractorService
      .addContractor(formData)
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
          this.notificationService.success('Contractor added successfully');
          this.appConfigurationService.refreshContractorDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.CONTRACTOR,
            ROUTES.SITE.CONTRACTOR.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add contractor');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Contractor',
      subtitle: 'Add a new contractor',
    };
  }
}
