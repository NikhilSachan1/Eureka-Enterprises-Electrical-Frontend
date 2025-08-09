import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { UserService } from '../../services/user.service';
import { LoggerService } from '@core/services';
import {
  RouterNavigationService,
  LoadingService,
  ConfirmationDialogService,
  NotificationService,
  TableService,
} from '@shared/services';
import {
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionClickEvent,
} from '@shared/models';
import { USER_TABLE_ENHANCED_CONFIG } from '../../config/table/get-user.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, map } from 'rxjs';
import {
  IUserGetBaseResponseDto,
  IUserGetRequestDto,
  IUserGetResponseDto,
} from '../../types/user.dto';
import { IUser } from '../../types/user.interface';
import { EDialogType, ETableActionType } from '@shared/types';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { createUserPermissionDeleteDialogConfig } from '../../config';
import { UserPermissionService } from '../../../user-permission-management/services/user-permission.service';
import {
  IUserPermissionsDeleteResponseDto,
  IUserPermissionsGetRequestDto,
  IUserPermissionsGetResponseDto,
} from '../../../user-permission-management/types/user-permissions.dto';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';

@Component({
  selector: 'app-get-user',
  imports: [DataTableComponent],
  templateUrl: './get-user.component.html',
  styleUrl: './get-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetUserComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly userPermissionService = inject(UserPermissionService);
  private readonly dataTableService = inject(TableService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected table!: IEnhancedTable;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      USER_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.loadUserList();
  }

  private loadUserList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Users',
      message: 'Please wait while we load the users...',
    });

    const paramData = this.prepareParamData();

    this.userService
      .getUserList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUserGetResponseDto) => {
          const mappedData = this.mapTableData(response);
          this.table.setData(mappedData);
          this.logger.logUserAction('Users loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load users', error);
        },
      });
  }

  private executeDeleteUserPermission(rowData: IUser): void {
    this.logger.logUserAction('Executing delete user permission');
    this.loadingService.show({
      title: 'Deleting User Permission(s)',
      message: 'Please wait while we delete the user permission(s)...',
    });

    const paramData = this.prepareParamDataForGetUserPermission(rowData);

    this.userPermissionService
      .getUserPermission(paramData)
      .pipe(
        map((response: IUserPermissionsGetResponseDto) => {
          this.logger.logUserAction('Get user permission response', response);

          const permissionIds = response.permissions
            .flatMap(module => module.permissions)
            .filter(permission => permission.source === 'override')
            .map(permission => permission.id);

          this.logger.logUserAction(
            'Extracted permission IDs for deletion',
            permissionIds
          );

          return {
            userId: rowData.id,
            permissionIds,
          };
        }),
        switchMap(deleteRequestFormData => {
          this.logger.logUserAction(
            'Calling delete user permissions API',
            deleteRequestFormData
          );
          return this.userPermissionService.deleteUserPermissions(
            deleteRequestFormData
          );
        }),
        finalize(() => {
          this.loadingService.hide();
          this.table.setData([]);
          this.loadUserList();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUserPermissionsDeleteResponseDto) => {
          this.logger.logUserAction('Delete permission response', response);
          this.notificationService.success(
            'User Permission(s) deleted successfully'
          );
        },
        error: error => {
          this.logger.logUserAction('Delete user permission error', error);
          this.notificationService.error('Failed to delete user permission(s)');
        },
      });
  }

  protected handleRowActionClick(event: ITableActionClickEvent): void {
    this.logger.logUserAction('Row action clicked', event);

    const { actionType, selectedRows } = event;

    switch (actionType) {
      case ETableActionType.SET_PERMISSIONS:
        this.navigateToSetUserPermissions(
          selectedRows as unknown as IUserGetBaseResponseDto
        );
        break;
      case ETableActionType.DELETE_PERMISSIONS:
        this.showSingleDeleteConfirmationDialog(
          selectedRows as unknown as IUser
        );
        break;
      default:
        this.logger.warn('Unknown row action:', actionType);
    }
  }

  private mapTableData(response: IUserGetResponseDto): Partial<IUser>[] {
    return response.records.map((record: IUserGetBaseResponseDto) => {
      return {
        id: record.id,
        fullName: `${record.firstName} ${record.lastName}`,
        email: record.email,
        status: record.status,
        permissionCount: `${record.userPermissionsCount} / ${record.rolePermissionsCount} / ${record.totalPermissions}`,
        role: record.role,
      };
    });
  }

  private navigateToSetUserPermissions(rowData: IUserGetBaseResponseDto): void {
    this.logger.logUserAction('Navigating to set user permissions');

    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER_PERMISSION,
        ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET_PERMISSIONS,
        rowData.id,
      ];

      const success =
        this.routerNavigationService.navigateToRoute(routeSegments);

      if (!success) {
        this.logger.logUserAction('Navigation failed for set user permissions');
      }
    } catch (error) {
      this.logger.logUserAction('Navigation error', error);
    }
  }

  private showSingleDeleteConfirmationDialog(rowData: IUser): void {
    this.logger.logUserAction(
      'Single user permission delete action triggered',
      rowData
    );

    const dialogConfig = createUserPermissionDeleteDialogConfig(rowData, () =>
      this.executeDeleteUserPermission(rowData)
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      EDialogType.DELETE
    );
  }

  private prepareParamDataForGetUserPermission(
    rowData: IUser
  ): IUserPermissionsGetRequestDto {
    return {
      userId: rowData.id,
    };
  }

  private prepareParamData(): IUserGetRequestDto {
    return {
      sortOrder: 'ASC',
      sortField: 'firstName',
    };
  }
}
