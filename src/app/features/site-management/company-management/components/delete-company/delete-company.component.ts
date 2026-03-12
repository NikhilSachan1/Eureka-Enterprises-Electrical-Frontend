import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  ICompanyDeleteFormDto,
  ICompanyDeleteResponseDto,
  ICompanyGetBaseResponseDto,
} from '../../types/company.dto';
import { CompanyService } from '../../services/company.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EButtonActionType } from '@shared/types';

@Component({
  selector: 'app-delete-company',
  imports: [],
  templateUrl: './delete-company.component.html',
  styleUrl: './delete-company.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteCompanyComponent
  extends FormBase<ICompanyDeleteFormDto>
  implements OnInit
{
  private readonly companyService = inject(CompanyService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<ICompanyGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeCompanyDeleteAction(formData);
  }

  private prepareFormData(
    record: ICompanyGetBaseResponseDto[]
  ): ICompanyDeleteFormDto {
    return {
      companyIds: record.map((row: ICompanyGetBaseResponseDto) => row.id),
    };
  }

  private executeCompanyDeleteAction(formData: ICompanyDeleteFormDto): void {
    const loadingMessage = {
      title: 'Deleting Company',
      message: 'Please wait while we delete the company...',
    };
    this.loadingService.show(loadingMessage);

    this.companyService
      .deleteCompany(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ICompanyDeleteResponseDto) => {
          this.notificationService.bulkOperationFromApiResponse(
            response,
            'company',
            EButtonActionType.DELETE
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
