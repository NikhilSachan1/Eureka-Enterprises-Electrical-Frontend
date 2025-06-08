import { Directive, inject, input, effect, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective {

  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  // Input signal for permission
  appHasPermission = input.required<string>();

  constructor() {
    // Effect to handle permission changes
    effect(() => {
      const permission = this.appHasPermission();
      if (permission && this.permissionService.hasPermission(permission)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
