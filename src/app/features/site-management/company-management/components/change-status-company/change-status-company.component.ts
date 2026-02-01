import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { CompanyService } from '../../services/company.service';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import {
  ICompanyChangeStatusFormDto,
  ICompanyChangeStatusResponseDto,
  ICompanyGetBaseResponseDto,
} from '../../types/company.dto';
import { ECompanyStatus } from '../../types/company.enum';
import { FORM_VALIDATION_MESSAGES, ICONS } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-change-status-company',
  imports: [NgClass],
  templateUrl: './change-status-company.component.html',
  styleUrl: './change-status-company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusCompanyComponent extends FormBase implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<ICompanyGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly ALL_COMPANY_STATUS = ECompanyStatus;
  protected readonly ICONS = ICONS;

  protected readonly currentStatus = computed(() => {
    const record = this.selectedRecord();
    return record?.[0].isActive
      ? this.ALL_COMPANY_STATUS.ACTIVE
      : this.ALL_COMPANY_STATUS.ARCHIVED;
  });

  protected readonly newStatus = computed(() => {
    const current = this.currentStatus();
    return current === this.ALL_COMPANY_STATUS.ACTIVE
      ? this.ALL_COMPANY_STATUS.ARCHIVED
      : this.ALL_COMPANY_STATUS.ACTIVE;
  });

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to change status of company but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const { id: companyId } = this.selectedRecord()[0];

    const formData = this.prepareFormData();
    this.executeCompanyChangeStatusAction(formData, companyId);
  }

  private prepareFormData(): ICompanyChangeStatusFormDto {
    return {
      companyStatus: this.newStatus(),
    };
  }

  private executeCompanyChangeStatusAction(
    formData: ICompanyChangeStatusFormDto,
    companyId: string
  ): void {
    const loadingMessage = {
      title: 'Changing Company Status',
      message: 'Please wait while we change the company status...',
    };
    this.loadingService.show(loadingMessage);

    this.companyService
      .changeCompanyStatus(formData, companyId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: ICompanyChangeStatusResponseDto) => {
          this.notificationService.success(
            'Company status changed successfully'
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to change company status', error);
          this.notificationService.error('Failed to change company status');
        },
      });
  }

  protected getStatusLabel(status: string): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.companyStatus(),
      status
    );
  }
}
