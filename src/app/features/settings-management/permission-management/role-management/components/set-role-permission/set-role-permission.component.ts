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

  protected readonly default = {
    'module-attendance_64d7b50b-6a8a-4d0b-9b59-ccb6c03ba832': true,
    'module-employee_e7c8fc0c-a227-4d44-a397-6145c4077b3f': true,
    'module-attendance_b0dfd0d9-14df-42e2-a9b8-c7b6dcfcc80d': true,
  }

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
