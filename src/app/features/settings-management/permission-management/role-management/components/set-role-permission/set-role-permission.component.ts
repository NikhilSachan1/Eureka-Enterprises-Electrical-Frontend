import { Component, computed } from '@angular/core';
import { SetPermissionComponent } from "../../../shared/set-permission/set-permission.component";
import { IPageHeaderConfig } from '../../../../../../shared/models/page-header-config.model';
import { PageHeaderComponent } from "../../../../../../shared/components/page-header/page-header.component";

@Component({
  selector: 'app-set-role-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-role-permission.component.html',
  styleUrl: './set-role-permission.component.scss'
})
export class SetRolePermissionComponent {

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig(),
  );

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set Role Permissions',
      subtitle: 'Set the permissions for the role',
    };
  }

}
