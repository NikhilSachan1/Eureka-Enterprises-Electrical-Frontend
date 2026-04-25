import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { APPLY_LEAVE_FORM_CONFIG } from '@features/leave-management/config';
import { LeaveService } from '@features/leave-management/services/leave.service';
import {
  ILeaveApplyFormDto,
  ILeaveBalanceGetResponseDto,
} from '@features/leave-management/types/leave.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { APPLY_LEAVE_PREFILLED_DATA } from '@shared/mock-data/apply-leave.mock-data';
import { FormBase } from '@shared/base/form.base';
import { LeaveBalanceCardsComponent } from '../../shared/components/leave-balance-cards/leave-balance-cards.component';

@Component({
  selector: 'app-apply-leave',
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    ButtonComponent,
    PageHeaderComponent,
    LeaveBalanceCardsComponent,
  ],
  templateUrl: './apply-leave.component.html',
  styleUrl: './apply-leave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyLeaveComponent
  extends FormBase<ILeaveApplyFormDto>
  implements OnInit
{
  private readonly leaveService = inject(LeaveService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly leaveBalance = signal<
    ILeaveBalanceGetResponseDto['records'][number] | null
  >(null);
  protected readonly showApplyLeaveFields = computed(() => {
    const balance = this.leaveBalance();
    if (!balance) {
      return true;
    }

    const availableBalance = Number.parseFloat(balance.availableBalance ?? '0');
    return Number.isFinite(availableBalance) && availableBalance > 0;
  });

  ngOnInit(): void {
    this.form = this.formService.createForm<ILeaveApplyFormDto>(
      APPLY_LEAVE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(APPLY_LEAVE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeApplyLeave(formData);
  }

  private prepareFormData(): ILeaveApplyFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeApplyLeave(formData: ILeaveApplyFormDto): void {
    this.loadingService.show({
      title: 'Submitting leave request',
      message:
        "We're submitting your leave request. This will just take a moment.",
    });
    this.form.disable();

    this.leaveService
      .applyLeave(formData)
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
          this.notificationService.success('Leave applied successfully');
          const routeSegments = [ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply leave');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Apply Leave',
      subtitle: 'Apply for a new leave',
      showHeaderButton: false,
    };
  }
}
