import {
  Directive,
  effect,
  inject,
  Input,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { AppPermissionService } from '@core/services';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class AppPermissionDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(AppPermissionService);

  private readonly permission = signal('');
  private hasView = false;

  constructor() {
    effect(() => {
      const permission = this.permission();

      if (!permission) {
        this.createView();
        return;
      }

      const hasPermission = this.permissionService.hasPermission(permission);

      if (hasPermission) {
        this.createView();
      } else {
        this.clearView();
      }
    });
  }

  @Input()
  set appHasPermission(value: string | null | undefined) {
    this.permission.set(value ?? '');
  }

  private createView(): void {
    if (this.hasView) {
      return;
    }

    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private clearView(): void {
    if (!this.hasView) {
      return;
    }

    this.viewContainer.clear();
    this.hasView = false;
  }
}
