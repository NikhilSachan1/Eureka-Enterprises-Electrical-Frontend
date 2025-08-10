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

  private permissionName = '';

  @Input()
  set appHasPermission(permission: string) {
    this.permissionName = permission.trim();
    this.updateView();
  }

  private updateView(): void {
    if (this.permissionService.hasPermission(this.permissionName)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
