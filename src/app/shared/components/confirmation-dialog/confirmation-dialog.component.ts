import { Component, ViewChild, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonComponent } from '../button/button.component';
import { InputFieldComponent } from '../input-field/input-field.component';
import { ConfirmationDialogService } from '../../services/confirmation-dialog-config.service';
import { IButtonConfig } from '../../models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, ButtonComponent, InputFieldComponent, ReactiveFormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {

  @ViewChild('cd') confirmDialog: any;

  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private destroy$ = new Subject<void>();

  // Essential state signals
  protected currentFormGroup = signal<FormGroup | null>(null);
  protected onAcceptCallback = signal<((formData?: any) => void) | undefined>(undefined);
  protected onRejectCallback = signal<((formData?: any) => void) | undefined>(undefined);
  protected currentDialogConfig = signal<any>(null);

  // Button configurations
  acceptButtonConfig = computed<Partial<IButtonConfig>>(() => {
    const dialog = this.currentDialogConfig();
    return {
      label: dialog?.acceptButtonProps?.label,
      icon: dialog?.acceptButtonProps?.icon,
      fluid: false
    };
  });

  rejectButtonConfig = computed<Partial<IButtonConfig>>(() => {
    const dialog = this.currentDialogConfig();
    return {
      label: dialog?.rejectButtonProps?.label,
      icon: dialog?.rejectButtonProps?.icon,
      fluid: false
    };
  });

  ngOnInit(): void {
    this.confirmationDialogService.getDialogState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.currentFormGroup.set(state.formGroup);
        this.onAcceptCallback.set(state.onAccept);
        this.onRejectCallback.set(state.onReject);
        this.currentDialogConfig.set(state.config);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleDialog(confirmed: boolean): void {
    const formGroup = this.currentFormGroup();
    let formData = null;

    if (formGroup) {
      if (confirmed && formGroup.invalid) {
        formGroup.markAllAsTouched();
        return;
      }
      formData = formGroup.value;
    }

    // Execute callbacks
    if (confirmed) {
      this.onAcceptCallback()?.(formData);
    } else {
      this.onRejectCallback()?.(formData);
    }

    this.confirmDialog?.close();
  }
} 