import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeDeleteFormDto,
  IEmployeeDeleteResponseDto,
  IEmployeeGetBaseResponseDto,
} from '@features/employee-management/types/employee.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EMPLOYEE_MESSAGES } from '../../constants';
import {
  ConfirmationDialogService,
  AppConfigurationService,
} from '@shared/services';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-delete-employee',
  imports: [],
  templateUrl: './delete-employee.component.html',
  styleUrl: './delete-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteEmployeeComponent extends FormBase implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  protected readonly selectedRecord =
    input.required<IEmployeeGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete employee but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeEmployeeDeleteAction(formData);
  }

  private prepareFormData(
    record: IEmployeeGetBaseResponseDto[]
  ): IEmployeeDeleteFormDto {
    return {
      employeeIds: record.map((row: IEmployeeGetBaseResponseDto) => row.id),
    };
  }

  private executeEmployeeDeleteAction(formData: IEmployeeDeleteFormDto): void {
    const loadingMessage = {
      title: EMPLOYEE_MESSAGES.LOADING.DELETE,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.DELETE,
    };
    this.loadingService.show(loadingMessage);

    this.employeeService
      .deleteEmployee(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEmployeeDeleteResponseDto) => {
          this.notificationService.bulkOperationFromResponse(response, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? EMPLOYEE_MESSAGES.SUCCESS.DELETE
                  : `Successfully deleted ${count} employees.`,
              error: () => EMPLOYEE_MESSAGES.ERROR.DELETE,
              empty: EMPLOYEE_MESSAGES.ERROR.DELETE,
            },
          });

          this.appConfigurationService.refreshEmployeeDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(EMPLOYEE_MESSAGES.ERROR.DELETE, error);
          this.notificationService.error(EMPLOYEE_MESSAGES.ERROR.DELETE);
        },
      });
  }
}
