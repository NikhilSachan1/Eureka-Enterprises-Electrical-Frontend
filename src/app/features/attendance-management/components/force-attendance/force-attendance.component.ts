import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from '../../config';
import { IAttendanceForceFormDto } from '@features/attendance-management/types/attendance.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FORCE_ATTENDANCE_PREFILLED_DATA } from '@shared/mock-data/force-attendance.mock-data';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-force-attendance',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './force-attendance.component.html',
  styleUrl: './force-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceAttendanceComponent
  extends FormBase<IAttendanceForceFormDto>
  implements OnInit
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IAttendanceForceFormDto>(
      FORCE_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(FORCE_ATTENDANCE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceAttendance(formData);
  }

  private prepareFormData(): IAttendanceForceFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeForceAttendance(formData: IAttendanceForceFormDto): void {
    this.loadingService.show({
      title: 'Force Attendance',
      message: 'Please wait while we force attendance...',
    });
    this.form.disable();

    this.attendanceService
      .forceAttendance(formData)
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
          this.notificationService.success(
            'Force attendance applied successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.ATTENDANCE,
            ROUTES.ATTENDANCE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply force attendance');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Attendance',
      subtitle: 'Force attendance on behalf of an employee',
    };
  }
}
