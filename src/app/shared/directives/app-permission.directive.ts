import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { AppPermissionService } from '@core/services';

@Directive({
  selector: '[appHasPermission]',
})
export class AppPermissionDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(AppPermissionService);

  private hasView = false;

  @Input()
  set appHasPermission(permission: string[]) {
    this.updateView(permission);
  }

  private updateView(permission: string[]): void {
    const hasPermission = this.permissionService.hasAnyPermission(permission);

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
