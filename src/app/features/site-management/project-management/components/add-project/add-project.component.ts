import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IProjectAddFormDto } from '../../types/project.dto';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ProjectService } from '../../services/project.service';
import type { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { ADD_PROJECT_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ADD_PROJECT_PREFILLED_DATA } from '@shared/mock-data/add-project.mock-data';

@Component({
  selector: 'app-add-project',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-project.component.html',
  styleUrl: './add-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProjectComponent
  extends FormBase<IProjectAddFormDto>
  implements OnInit
{
  private readonly projectService = inject(ProjectService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  private trackedProjectFields!: ITrackedFields<IProjectAddFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  constructor() {
    super();
    effect(() => {
      if (this.trackedProjectFields && this.trackedProjectFields.companyName) {
        const companyName = this.trackedProjectFields.companyName();
        if (companyName && typeof companyName === 'string') {
          this.loadCompanyDetail(companyName);
        }
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IProjectAddFormDto>(
      ADD_PROJECT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_PROJECT_PREFILLED_DATA);

    this.trackedProjectFields =
      this.formService.trackMultipleFieldChanges<IProjectAddFormDto>(
        this.form.formGroup,
        ['companyName'],
        this.destroyRef
      );
  }

  private loadCompanyDetail(companyId: string): void {
    const company = this.appConfigurationService
      .companyList()
      .find(({ value }) => value === companyId)
      ?.data as ICompanyGetBaseResponseDto;

    if (!company) {
      return;
    }

    const prefilledCompanyAddressData =
      this.preparePrefilledCompanyAddressData(company);
    this.form.patch(prefilledCompanyAddressData);
  }

  private preparePrefilledCompanyAddressData(
    company: ICompanyGetBaseResponseDto
  ): Partial<IProjectAddFormDto> {
    return {
      blockNumber: company.blockNumber ?? '',
      streetName: company.streetName ?? '',
      landmark: company.landmark ?? '',
      city: company.city ?? '',
      state: company.state ?? '',
      pincode: company.pincode ?? '',
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddProject(formData);
  }

  private prepareFormData(): IProjectAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddProject(formData: IProjectAddFormDto): void {
    this.loadingService.show({
      title: 'Adding project',
      message: "We're adding the project. This will just take a moment.",
    });
    this.form.disable();

    this.projectService
      .addProject(formData)
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
          this.notificationService.success('Project added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.PROJECT,
            ROUTES.SITE.PROJECT.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add project');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Project',
      subtitle: 'Add a new project',
    };
  }
}
