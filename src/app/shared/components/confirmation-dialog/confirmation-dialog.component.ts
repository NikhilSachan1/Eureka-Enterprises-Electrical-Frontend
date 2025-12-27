import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  viewChild,
  ViewContainerRef,
  effect,
  ComponentRef,
} from '@angular/core';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationDialogService } from '@shared/services';
import {
  IButtonConfig,
  IDialogActionConfig,
  IDialogActionHandler,
} from '@shared/types';
import { ButtonComponent } from '../button/button.component';
import { ViewDetailComponent } from '../view-detail/view-detail.component';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, ButtonComponent, ViewDetailComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  readonly confirmDialog = viewChild.required<ConfirmDialog>('cd');
  readonly dynamicComponentContainer = viewChild<unknown, ViewContainerRef>(
    'dynamicComponentContainer',
    { read: ViewContainerRef }
  );

  private dynamicComponentRef?: ComponentRef<unknown>;

  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly currentDialogConfig =
    this.confirmationDialogService.dialogState;

  constructor() {
    effect(() => {
      const config = this.currentDialogConfig();
      this.loadDynamicComponent(config);
    });

    this.confirmationDialogService.setCloseCallback(() => {
      this.confirmDialog()?.close();
    });
  }

  protected readonly acceptButtonConfig = computed<Partial<IButtonConfig>>(
    () => {
      const dialog = this.currentDialogConfig();
      return {
        label: dialog.dialogConfig.acceptButtonProps?.label,
        icon: dialog.dialogConfig.acceptButtonProps?.icon,
        visible: dialog.dialogConfig.acceptButtonProps?.visible,
        id: dialog.dialogConfig.acceptButtonProps?.id,
      };
    }
  );

  protected readonly rejectButtonConfig = computed<Partial<IButtonConfig>>(
    () => {
      const dialog = this.currentDialogConfig();
      return {
        label: dialog.dialogConfig.rejectButtonProps?.label,
        icon: dialog.dialogConfig.rejectButtonProps?.icon,
        visible: dialog.dialogConfig.rejectButtonProps?.visible,
        id: dialog.dialogConfig.rejectButtonProps?.id,
      };
    }
  );

  protected readonly isAcceptButtonVisible = computed(() => {
    const dialog = this.currentDialogConfig();
    return dialog.dialogConfig.acceptButtonProps?.visible !== false;
  });

  protected readonly isRejectButtonVisible = computed(() => {
    const dialog = this.currentDialogConfig();
    return dialog.dialogConfig.rejectButtonProps?.visible !== false;
  });

  protected async handleDialog(confirmed: boolean): Promise<void> {
    if (confirmed) {
      await this.handleAccept();
    } else {
      await this.handleReject();
    }
  }

  private async handleAccept(): Promise<void> {
    if (this.dynamicComponentRef) {
      const componentInstance = this.dynamicComponentRef
        .instance as IDialogActionHandler;
      if (componentInstance.onDialogAccept) {
        await componentInstance.onDialogAccept();
      } else {
        this.confirmationDialogService.closeDialog();
      }
    } else {
      this.confirmationDialogService.closeDialog();
    }
  }

  private async handleReject(): Promise<void> {
    if (this.dynamicComponentRef) {
      const componentInstance = this.dynamicComponentRef
        .instance as IDialogActionHandler;
      if (componentInstance.onDialogReject) {
        await componentInstance.onDialogReject();
      } else {
        this.confirmationDialogService.closeDialog();
      }
    } else {
      this.confirmationDialogService.closeDialog();
    }
  }

  private loadDynamicComponent(config: IDialogActionConfig): void {
    const container = this.dynamicComponentContainer();
    if (!container) {
      return;
    }

    container.clear();
    this.dynamicComponentRef?.destroy();

    const dynamicComponent = config?.dynamicComponent;
    if (!dynamicComponent) {
      return;
    }

    const ref = container.createComponent(dynamicComponent);
    this.dynamicComponentRef = ref;

    const inputs = config.dynamicComponentInputs;
    if (inputs) {
      Object.entries(inputs).forEach(([key, value]) =>
        ref.setInput(key, value)
      );
    }
  }
}
