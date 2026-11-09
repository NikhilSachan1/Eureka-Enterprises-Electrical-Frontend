import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { AuthService } from '../../services/auth.service';

/** Runs the confirmed "Login as" action; the dialog itself renders the content. */
@Component({
  selector: 'app-impersonate-user',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpersonateUserComponent extends FormBase {
  private readonly authService = inject(AuthService);

  protected readonly selectedRecord = input.required<{ id: string }[]>();

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const [target] = this.selectedRecord();

    this.loadingService.show({
      title: 'Signing in',
      message: 'Opening this account. This will just take a moment.',
    });

    this.authService
      .startImpersonation(target.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // On success the page reloads into the target account.
        error: error => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.logger.error('Failed to sign in as user', error);
          this.notificationService.error('Could not sign in as this user.');
        },
      });
  }
}
