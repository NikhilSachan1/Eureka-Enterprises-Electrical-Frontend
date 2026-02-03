import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IProjectDetailGetResponseDto,
  IProjectEditFormDto,
} from '../../types/project.dto';
import { ProjectService } from '../../services/project.service';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import { EDIT_PROJECT_FORM_CONFIG } from '../../config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';

@Component({
  selector: 'app-edit-project',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-project.component.html',
  styleUrl: './edit-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProjectComponent
  extends FormBase<IProjectEditFormDto>
  implements OnInit
{
  private readonly projectService = inject(ProjectService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private trackedProjectFields!: ITrackedFields<IProjectEditFormDto>;
  private isInitialCompanyLoad = true;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialProjectData = signal<IProjectEditFormDto | null>(
    null
  );

  constructor() {
    super();
    effect(() => {
      if (this.trackedProjectFields && this.trackedProjectFields.companyName) {
        const companyName = this.trackedProjectFields.companyName();
        if (companyName && typeof companyName === 'string') {
          if (this.isInitialCompanyLoad) {
            this.isInitialCompanyLoad = false;
            return;
          }
          this.loadCompanyDetail(companyName);
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadProjectDataFromRoute();

    this.form = this.formService.createForm<IProjectEditFormDto>(
      EDIT_PROJECT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialProjectData(),
      }
    );

    this.trackedProjectFields =
      this.formService.trackMultipleFieldChanges<IProjectEditFormDto>(
        this.form.formGroup,
        ['companyName'],
        this.destroyRef
      );
  }

  private loadProjectDataFromRoute(): void {
    const projectDetailFromResolver = this.activatedRoute.snapshot.data[
      'projectDetail'
    ] as IProjectDetailGetResponseDto;

    if (!projectDetailFromResolver) {
      this.logger.logUserAction('No project data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledProjectData = this.preparePrefilledFormData(
      projectDetailFromResolver
    );
    this.initialProjectData.set(prefilledProjectData);
  }

  private preparePrefilledFormData(
    projectDetailFromResolver: IProjectDetailGetResponseDto
  ): IProjectEditFormDto {
    const {
      name,
      companyId,
      siteContractors,
      managerName,
      managerContact,
      startDate,
      endDate,
      baseDistanceKm,
      estimatedBudget,
      blockNumber,
      streetName,
      landmark,
      city,
      state,
      pincode,
      workTypes,
      notes,
    } = projectDetailFromResolver;

    return {
      projectName: name,
      companyName: companyId,
      contractorNames:
        siteContractors?.map(contractor => contractor.contractorId) ?? [],
      siteManagerName: managerName,
      siteManagerContact: managerContact,
      timeline: [new Date(startDate), new Date(endDate)],
      baseDistanceKm: Number(baseDistanceKm),
      estimatedBudget: Number(estimatedBudget),
      blockNumber,
      streetName,
      landmark,
      city,
      state,
      pincode,
      workTypes,
      remarks: notes,
    };
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
  ): Partial<IProjectEditFormDto> {
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
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditProject(formData, projectId);
  }

  private prepareFormData(): IProjectEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditProject(
    formData: IProjectEditFormDto,
    projectId: string
  ): void {
    this.loadingService.show({
      title: 'Edit Project',
      message: 'Please wait while we edit project...',
    });
    this.form.disable();

    this.projectService
      .editProject(formData, projectId)
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
          this.notificationService.success('Project updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.PROJECT,
            ROUTES.SITE.PROJECT.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update project');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialProjectData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Project',
      subtitle: 'Edit a project',
    };
  }
}
