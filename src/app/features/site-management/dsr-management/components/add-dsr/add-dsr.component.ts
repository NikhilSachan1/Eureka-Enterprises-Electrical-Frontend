import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ADD_DSR_FORM_CONFIG } from '@features/site-management/dsr-management/config';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  IDsrAddFormDto,
  IDsrAddUIFormDto,
} from '@features/site-management/dsr-management/types/dsr.dto';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ADD_DSR_PREFILLED_DATA } from '@shared/mock-data/add-dsr.mock-data';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-dsr',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-dsr.component.html',
  styleUrl: './add-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDsrComponent
  extends FormBase<IDsrAddUIFormDto>
  implements OnInit
{
  private readonly dsrService = inject(DsrService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  private projectId = '';

  ngOnInit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    this.projectId = projectId;

    this.form = this.formService.createForm<IDsrAddUIFormDto>(
      ADD_DSR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_DSR_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.projectId);
    this.executeAddDsr(formData);
  }

  private prepareFormData(projectId: string): IDsrAddFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      projectName: projectId,
    };
  }

  private executeAddDsr(formData: IDsrAddFormDto): void {
    this.loadingService.show({
      title: 'Add DSR',
      message: "We're adding DSR. This will just take a moment.",
    });
    this.form.disable();

    this.dsrService
      .addDsr(formData)
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
          this.notificationService.success('DSR added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.PROJECT,
            ROUTES.SITE.PROJECT.ANALYSIS,
            this.projectId,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add DSR');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add DSR',
      subtitle: 'Add a new DSR',
    };
  }
}
