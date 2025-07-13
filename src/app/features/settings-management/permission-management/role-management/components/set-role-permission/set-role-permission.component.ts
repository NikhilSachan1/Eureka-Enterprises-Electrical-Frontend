import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SetPermissionComponent } from "../../../shared/set-permission/component/set-permission.component";
import { IPageHeaderConfig } from '../../../../../../shared/models/page-header-config.model';
import { PageHeaderComponent } from "../../../../../../shared/components/page-header/page-header.component";
import { ActivatedRoute } from '@angular/router';
import { RouterNavigationService } from '../../../../../../shared/services/router-navigation.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { ROUTE_BASE_PATHS } from '../../../../../../shared/constants/route.constants';
import { IGetRolePermissionsResponseDto } from '../../models/role-permission.api.model';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { FORM_VALIDATION_MESSAGES } from '../../../../../../shared/constants';
import { LoadingService } from '../../../../../../shared/services';
import { RoleManagementService } from '../../services/role-management.service';

@Component({
  selector: 'app-set-role-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-role-permission.component.html',
  styleUrl: './set-role-permission.component.scss'
})
export class SetRolePermissionComponent implements OnInit {

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig(),
  );

  protected readonly isSubmitting = signal(false);
  protected readonly editRolePermissionData = signal<Record<string, any> | null>(null);

  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly roleManagementService = inject(RoleManagementService);

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set Role Permissions',
      subtitle: 'Set the permissions for the role',
    };
  }

  ngOnInit(): void {
    this.loadRolePermissionDataFromRoute();
  }

  private loadRolePermissionDataFromRoute(): void {
    
    const rolePermissionRouteData = this.activatedRoute.snapshot.data['rolePermissionData'] as IGetRolePermissionsResponseDto | null;
    
    if (!rolePermissionRouteData) {
      this.logger.logUserAction('No role permission data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
      ];
      this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const rolePermissionData = this.prepareRolePermissionData(rolePermissionRouteData);
    this.editRolePermissionData.set(rolePermissionData);
  }

  protected onSubmit(): void {

    if (this.isSubmitting()) {
      return;
    }

    const formData = this.prepareFormData();
    const roleId = this.activatedRoute.snapshot.paramMap.get('roleId');

    if (!roleId) {
      this.logger.logUserAction('No role id found in route');
      this.notificationService.error(FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG);
      return;
    }

    // this.executeSetRolePermission(formData, roleId);
  }

  private executeSetRolePermission(formData: Record<string, any>, roleId: string): void {

    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating Role Permission',
      message: 'Please wait while we update the role permission...',
    });

  }

  private prepareFormData() {
   
  }

  private prepareRolePermissionData(rolePermissionRouteData: IGetRolePermissionsResponseDto): Record<string, any> {
    const rolePermissionData = rolePermissionRouteData.records.reduce((acc, record) => {
      acc[record.permissionId] = record.isActive;
      return acc;
    }, {} as Record<string, boolean>);
    return rolePermissionData;
  }


}
