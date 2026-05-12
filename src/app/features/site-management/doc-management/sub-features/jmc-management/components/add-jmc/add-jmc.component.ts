import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IAddJmcFormDto,
  IAddJmcResponseDto,
  IAddJmcUIFormDto,
} from '../../types/jmc.dto';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
} from '@shared/types';
import { JmcService } from '../../services/jmc.service';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { ADD_JMC_FORM_CONFIG } from '../../config';
import { finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-jmc.component.html',
  styleUrl: './add-jmc.component.scss',
})
export class AddJmcComponent
  extends FormBase<IAddJmcUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly jmcService = inject(JmcService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    this.form = this.formService.createForm<IAddJmcUIFormDto>(
      ADD_JMC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAddJmcAction();
  }

  private executeAddJmcAction(): void {
    const file = this.form.getFieldData('jmcAttachment');

    this.loadingService.show({
      title: 'Adding JMC',
      message:
        "Please wait while we're adding the JMC. This will just take a moment.",
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.jmcService.addJmc(formData);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add JMC', error);
          this.notificationService.error(
            'Could not add the JMC. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IAddJmcFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['jmcAttachment'];
    return {
      ...record,
      jmcFileKey: attachmentResponse.fileKey,
      jmcFileName: attachmentResponse.fileName,
    };
  }
}
