import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EDIT_DSR_FORM_CONFIG } from '@features/site-management/project-management/config';
import { DsrService } from '@features/site-management/project-management/services/dsr.service';
import {
  IDsrEditFormDto,
  IDsrEditUIFormDto,
} from '@features/site-management/project-management/types/project.dto';
import { IDsrDetailResolverResponse } from '@features/site-management/project-management/types/project.interface';
import { FormBase } from '@shared/base/form.base';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-edit-dsr',
  imports: [
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    PageHeaderComponent,
  ],
  templateUrl: './edit-dsr.component.html',
  styleUrl: './edit-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDsrComponent
  extends FormBase<IDsrEditUIFormDto>
  implements OnInit
{
  private readonly dsrService = inject(DsrService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly initialDsrData = signal<IDsrEditUIFormDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.loadDsrDataFromRoute();

    this.form = this.formService.createForm<IDsrEditUIFormDto>(
      EDIT_DSR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialDsrData(),
      }
    );
  }

  private loadDsrDataFromRoute(): void {
    const dsrDetailFromResolver = this.activatedRoute.snapshot.data[
      'dsrDetail'
    ] as IDsrDetailResolverResponse | null;

    if (!dsrDetailFromResolver) {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.DAILY_STATUS.ADD,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledDsrData = this.preparePrefilledFormData(
      dsrDetailFromResolver
    );
    this.initialDsrData.set(prefilledDsrData);
  }

  private preparePrefilledFormData(
    dsrDetailFromResolver: IDsrDetailResolverResponse
  ): IDsrEditUIFormDto {
    const preloadedFiles = dsrDetailFromResolver.preloadedFiles ?? [];

    const {
      reportDate,
      workTypes,
      reportingEngineerName,
      reportingEngineerContact,
      remarks,
    } = dsrDetailFromResolver;
    return {
      statusDate: new Date(reportDate),
      workDone: workTypes,
      reportedEngineerName: reportingEngineerName,
      reportedEngineerContact: Number(reportingEngineerContact),
      note: remarks,
      dsrAttachments: preloadedFiles,
    };
  }

  protected override handleSubmit(): void {
    const dsrId = this.activatedRoute.snapshot.params['dsrId'] as string;
    if (!dsrId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditDsr(formData, dsrId);
  }

  private prepareFormData(): IDsrEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditDsr(formData: IDsrEditFormDto, dsrId: string): void {
    this.loadingService.show({
      title: 'Edit DSR',
      message: 'Please wait while we edit DSR...',
    });
    this.form.disable();

    this.dsrService
      .editDsr(formData, dsrId)
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
          this.notificationService.success('DSR updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.PROJECT,
            ROUTES.SITE.PROJECT.DAILY_STATUS.ADD,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: (): void => {
          this.notificationService.error('Failed to update DSR');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialDsrData() ?? {});
  }

  protected getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit DSR',
      subtitle: 'Edit a DSR',
    };
  }
}
