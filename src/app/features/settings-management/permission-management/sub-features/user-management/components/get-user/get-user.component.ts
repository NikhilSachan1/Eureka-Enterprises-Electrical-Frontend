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
import { IEnhancedTable, IEnhancedTableConfig } from '@shared/models';
import { USER_TABLE_ENHANCED_CONFIG } from '../../config/table/get-user.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  IUserGetBaseResponseDto,
  IUserGetRequestDto,
  IUserGetResponseDto,
} from '../../types/user.dto';
import { DataTableComponent } from '@shared/components';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { IUser } from '../../types/user.interface';

@Component({
  selector: 'app-get-user',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './get-user.component.html',
  styleUrl: './get-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetUserComponent implements OnInit {
  private readonly userService = inject(UserService);
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

  private prepareParamData(): IUserGetRequestDto {
    return {
      sortOrder: 'ASC',
      sortField: 'firstName',
    };
  }
}
