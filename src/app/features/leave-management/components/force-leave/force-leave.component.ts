import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FORCE_LEAVE_FORM_CONFIG } from '@features/leave-management/config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import { ILeaveForceFormDto } from '@features/leave-management/types/leave.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { FORCE_LEAVE_PREFILLED_DATA } from '@shared/mock-data/force-leave.mock-data';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-force-leave',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './force-leave.component.html',
  styleUrl: './force-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceLeaveComponent
  extends FormBase<ILeaveForceFormDto>
  implements OnInit
{
  private readonly leaveService = inject(LeaveService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<ILeaveForceFormDto>(
      FORCE_LEAVE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(FORCE_LEAVE_PREFILLED_DATA);
  }

  override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceLeave(formData);
  }

  private prepareFormData(): ILeaveForceFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeForceLeave(formData: ILeaveForceFormDto): void {
    this.loadingService.show({
      title: 'Force Leave',
      message: 'Please wait while we process the force leave...',
    });
    this.form.disable();

    this.leaveService
      .forceLeave(formData)
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
          this.notificationService.success('Force leave applied successfully');
          const routeSegments = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply force leave');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Leave',
      subtitle: 'Force a leave on behalf of an employee',
    };
  }
}
