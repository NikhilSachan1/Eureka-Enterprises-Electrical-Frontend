import {
  Component,
  signal,
  inject,
  OnInit,
  input,
  computed,
  output,
  effect,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { ICONS } from '@shared/constants';
import { EButtonSeverity, EButtonVariant, IButtonConfig } from '@shared/types';
import { LoadingService } from '@shared/services';
import { IModulePermission } from '../../../sub-features/system-permission-management/types/system-permission.interface';
import { SystemPermissionService } from '../../../sub-features/system-permission-management/services/system-permission.service';
import {
  ICategorizedPermissions,
  IDefaultPermissions,
  IRolePermissionMatrixColumn,
  IMatrixModuleSaveEvent,
  IMatrixRolePermissionUpdate,
  IMatrixRoleStatsSummary,
  IModuleStats,
} from '../../types/set-permission.interface';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';

const STAT_LABEL = {
  TOTAL: 'Total',
  GRANTED: 'Granted',
  REVOKED: 'Revoked',
  NEW: 'New',
} as const;

function buildStatsArray(
  total: number,
  granted: number,
  revoked: number,
  newCount: number
): IModuleStats[] {
  return [
    {
      label: STAT_LABEL.TOTAL,
      value: total,
      colorClass: 'text-content-secondary',
      icon: ICONS.STATUS.TOTAL,
    },
    {
      label: STAT_LABEL.GRANTED,
      value: granted,
      colorClass: 'text-emerald-600',
      icon: ICONS.SECURITY.LOCK_OPEN,
    },
    {
      label: STAT_LABEL.REVOKED,
      value: revoked,
      colorClass: 'text-red-600',
      icon: ICONS.SECURITY.LOCK,
    },
    {
      label: STAT_LABEL.NEW,
      value: newCount,
      colorClass: 'text-blue-600',
      icon: ICONS.COMMON.PLUS,
    },
  ];
}

function matrixCellKey(roleId: string, permissionId: string): string {
  return `${roleId}:${permissionId}`;
}

@Component({
  selector: 'app-set-permission',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    PanelModule,
    CheckboxModule,
    ButtonComponent,
    EmptyMessagesComponent,
    TextCasePipe,
  ],
  templateUrl: './set-permission.component.html',
  styleUrls: ['./set-permission.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetPermissionComponent implements OnInit {
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);

  protected readonly icons = ICONS;

  protected readonly modulePermissions = signal<IModulePermission[]>([]);
  protected readonly matrixState = signal<
    Record<string, Record<string, boolean>>
  >({});
  private readonly matrixInitialized = signal(false);

  protected readonly modulePendingCounts = computed(() => {
    this.matrixState();

    return this.modulePermissions().reduce<Record<string, number>>(
      (acc, module) => {
        acc[module.id] = this.getModulePendingCount(module);
        return acc;
      },
      {}
    );
  });
  protected readonly computedModuleRoleStats = computed(() => {
    this.matrixState();

    return this.modulePermissions().reduce<
      Record<string, IMatrixRoleStatsSummary[]>
    >((acc, module) => {
      acc[module.id] = this.buildModuleRoleStats(module);
      return acc;
    }, {});
  });
  protected readonly globalPendingCount = computed(() => {
    const counts = this.modulePendingCounts();
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  });
  protected readonly moduleUpdateButtonConfigs = computed(() => {
    const pendingCounts = this.modulePendingCounts();
    const submitting = this.isSubmitting();

    return this.modulePermissions().reduce<
      Record<string, Partial<IButtonConfig>>
    >((acc, module) => {
      const pendingCount = pendingCounts[module.id] ?? 0;

      acc[module.id] = {
        ...this.matrixModuleUpdateButtonConfig,
        label: pendingCount ? `Update (${pendingCount})` : 'Update',
        disabled: pendingCount === 0 || submitting,
      };

      return acc;
    }, {});
  });

  protected readonly collapsedByModuleId = signal<Record<string, boolean>>({});
  private readonly loadedModuleIds = signal<Record<string, true>>({});

  readonly roleColumns = input<IRolePermissionMatrixColumn[]>([]);
  readonly roleDefaultPermissions = input<Record<string, IDefaultPermissions>>(
    {}
  );
  readonly isUserPermissionMode = input<boolean>(false);
  readonly isSubmitting = input<boolean>(false);

  readonly matrixModuleSave = output<IMatrixModuleSaveEvent>();

  protected readonly loadingState = this.loadingService.loadingState;

  protected readonly expandAllButtonConfig: Partial<IButtonConfig> = {
    label: 'Expand All',
    severity: EButtonSeverity.SUCCESS,
    variant: EButtonVariant.OUTLINED,
    icon: ICONS.ACTIONS.CHECK_CIRCLE,
    actionName: 'expandAll',
  };

  protected readonly collapseAllButtonConfig: Partial<IButtonConfig> = {
    label: 'Collapse All',
    severity: EButtonSeverity.DANGER,
    variant: EButtonVariant.OUTLINED,
    icon: ICONS.ACTIONS.TIMES,
    actionName: 'collapseAll',
  };

  protected readonly matrixModuleUpdateButtonConfig: Partial<IButtonConfig> = {
    label: 'Update',
    severity: EButtonSeverity.PRIMARY,
    variant: EButtonVariant.OUTLINED,
    actionName: 'updateModule',
  };

  constructor() {
    effect(() => {
      if (this.matrixInitialized()) {
        return;
      }

      const modules = this.modulePermissions();
      const roles = this.roleColumns();
      const defaults = this.roleDefaultPermissions();

      if (!modules.length || !roles.length || !Object.keys(defaults).length) {
        return;
      }

      this.initializeMatrixState();
      this.matrixInitialized.set(true);
    });
  }

  ngOnInit(): void {
    this.loadModulePermissions();
  }

  protected isMatrixGranted(
    moduleId: string,
    roleId: string,
    permissionId: string
  ): boolean {
    return (
      this.matrixState()[moduleId]?.[matrixCellKey(roleId, permissionId)] ??
      false
    );
  }

  protected onMatrixPermissionToggle(
    moduleId: string,
    roleId: string,
    permissionId: string,
    granted: boolean
  ): void {
    const key = matrixCellKey(roleId, permissionId);

    this.matrixState.update(state => ({
      ...state,
      [moduleId]: {
        ...state[moduleId],
        [key]: granted,
      },
    }));
  }

  protected getMatrixCellHighlightClass(
    moduleId: string,
    roleId: string,
    permissionId: string
  ): Record<string, boolean> {
    const wasGranted =
      this.roleDefaultPermissions()[roleId]?.[permissionId]?.value === true;
    const isChecked = this.isMatrixGranted(moduleId, roleId, permissionId);

    return {
      'matrix-checkbox-cell--granted': wasGranted && isChecked,
      'matrix-checkbox-cell--revoked': wasGranted && !isChecked,
      'matrix-checkbox-cell--new': !wasGranted && isChecked,
      'matrix-checkbox-cell--default': !wasGranted && !isChecked,
    };
  }

  protected getPermissionSource(
    permissionId: string
  ): 'override' | 'role' | undefined {
    const [role] = this.roleColumns();
    if (!role) {
      return undefined;
    }

    return this.roleDefaultPermissions()[role.id]?.[permissionId]?.source;
  }

  protected getModuleRoleSummary(
    moduleId: string,
    roleId: string
  ): IMatrixRoleStatsSummary | undefined {
    return this.computedModuleRoleStats()[moduleId]?.find(
      summary => summary.roleId === roleId
    );
  }

  protected onMatrixModuleUpdate(module: IModulePermission): void {
    const roleUpdates = this.buildRoleUpdatesForModule(module);
    if (!roleUpdates.length || !module.id) {
      return;
    }

    this.matrixModuleSave.emit({ moduleId: module.id, roleUpdates });
  }

  protected getModuleMetaLabel(module: IModulePermission): string {
    const permissionCount = this.getModulePermissionIds(module).length;
    const permissionLabel =
      permissionCount === 1 ? 'permission' : 'permissions';
    return `${permissionCount} ${permissionLabel}`;
  }

  protected onPanelBulkAction(actionName: string): void {
    if (actionName === 'expandAll') {
      this.expandAll();
    } else if (actionName === 'collapseAll') {
      this.collapseAll();
    }
  }

  public hasUnsavedChanges(): boolean {
    return this.globalPendingCount() > 0;
  }

  private loadModulePermissions(): void {
    this.loadingService.show({
      title: 'Loading module permissions',
      message:
        "We're loading module permissions. This will just take a moment.",
    });

    this.systemPermissionService
      .getSystemPermissionModuleWise()
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: modules => {
          this.modulePermissions.set(modules);
        },
        error: () => {
          this.modulePermissions.set([]);
          this.logger.logUserAction('Failed to load module permissions');
        },
      });
  }

  private expandAll(): void {
    const modules = this.modulePermissions();
    const next = modules.reduce<Record<string, boolean>>((acc, module) => {
      acc[module.id] = false;
      return acc;
    }, {});
    const loaded = modules.reduce<Record<string, true>>((acc, module) => {
      acc[module.id] = true;
      return acc;
    }, {});

    this.loadedModuleIds.set(loaded);
    this.collapsedByModuleId.set(next);
  }

  private collapseAll(): void {
    const next = this.modulePermissions().reduce<Record<string, boolean>>(
      (acc, module) => {
        acc[module.id] = true;
        return acc;
      },
      {}
    );
    this.collapsedByModuleId.set(next);
  }

  protected isModuleCollapsed(moduleId: string): boolean {
    return this.collapsedByModuleId()[moduleId] ?? true;
  }

  protected isModuleLoaded(moduleId: string): boolean {
    return Boolean(this.loadedModuleIds()[moduleId]);
  }

  protected onModuleCollapsedChange(
    moduleId: string,
    collapsed: boolean
  ): void {
    if (!collapsed) {
      this.loadedModuleIds.update(current => ({
        ...current,
        [moduleId]: true,
      }));
    }

    this.collapsedByModuleId.update(current => ({
      ...current,
      [moduleId]: collapsed,
    }));
  }

  private getModulePermissionIds(module: IModulePermission): string[] {
    return module.permissions
      .map(permission => permission.id)
      .filter((id): id is string => Boolean(id));
  }

  private buildModuleRoleStats(
    module: IModulePermission
  ): IMatrixRoleStatsSummary[] {
    const permissionIds = this.getModulePermissionIds(module);
    const roles = this.roleColumns();
    const defaults = this.roleDefaultPermissions();
    const moduleState = this.matrixState()[module.id] ?? {};
    const total = permissionIds.length;

    return roles.map(role => {
      let revoked = 0;
      let newCount = 0;
      let currentGranted = 0;

      permissionIds.forEach(permissionId => {
        const wasOriginallyGranted =
          defaults[role.id]?.[permissionId]?.value === true;
        const isCurrentlyChecked =
          moduleState[matrixCellKey(role.id, permissionId)] ?? false;

        if (isCurrentlyChecked) {
          currentGranted++;
        }

        if (wasOriginallyGranted) {
          if (!isCurrentlyChecked) {
            revoked++;
          }
        } else if (isCurrentlyChecked) {
          newCount++;
        }
      });

      return {
        roleId: role.id,
        label: role.label,
        name: role.name,
        total,
        currentGranted,
        stats: buildStatsArray(total, currentGranted, revoked, newCount),
        pending: revoked + newCount,
      };
    });
  }

  private initializeMatrixState(): void {
    const roles = this.roleColumns();
    const defaults = this.roleDefaultPermissions();
    const modules = this.modulePermissions();

    const state = modules.reduce<Record<string, Record<string, boolean>>>(
      (acc, module) => {
        const permissionIds = this.getModulePermissionIds(module);

        acc[module.id] = permissionIds.reduce<Record<string, boolean>>(
          (moduleAcc, permissionId) => {
            roles.forEach(role => {
              moduleAcc[matrixCellKey(role.id, permissionId)] =
                defaults[role.id]?.[permissionId]?.value ?? false;
            });
            return moduleAcc;
          },
          {}
        );

        return acc;
      },
      {}
    );

    this.matrixState.set(state);
  }

  private getModulePendingCount(module: IModulePermission): number {
    const permissionIds = this.getModulePermissionIds(module);
    const moduleState = this.matrixState()[module.id] ?? {};

    return this.roleColumns().reduce(
      (count, role) =>
        count +
        permissionIds.filter(permissionId =>
          this.hasMatrixCellPending(role.id, permissionId, moduleState)
        ).length,
      0
    );
  }

  private hasMatrixCellPending(
    roleId: string,
    permissionId: string,
    moduleState: Record<string, boolean>
  ): boolean {
    const wasGranted =
      this.roleDefaultPermissions()[roleId]?.[permissionId]?.value === true;
    const isChecked = moduleState[matrixCellKey(roleId, permissionId)] ?? false;
    return wasGranted !== isChecked;
  }

  private buildRoleUpdatesForModule(
    module: IModulePermission
  ): IMatrixRolePermissionUpdate[] {
    const permissionIds = this.getModulePermissionIds(module);
    const moduleState = this.matrixState()[module.id] ?? {};

    return this.roleColumns()
      .map(role => {
        const categorizedPermissions = this.getCategorizePermissionsForRole(
          role.id,
          permissionIds,
          moduleState
        );
        const hasChanges =
          categorizedPermissions.defaultPermissions.length +
            categorizedPermissions.revokedPermissions.length +
            categorizedPermissions.newPermissions.length >
          0;

        if (!hasChanges) {
          return null;
        }

        return {
          roleId: role.id,
          categorizedPermissions,
        };
      })
      .filter(
        (update): update is IMatrixRolePermissionUpdate => update !== null
      );
  }

  private getCategorizePermissionsForRole(
    roleId: string,
    permissionIds: string[],
    moduleState: Record<string, boolean>
  ): ICategorizedPermissions {
    const categorizedPermissions: ICategorizedPermissions = {
      defaultPermissions: [],
      revokedPermissions: [],
      newPermissions: [],
    };

    permissionIds.forEach(permissionId => {
      if (!this.hasMatrixCellPending(roleId, permissionId, moduleState)) {
        return;
      }

      const wasGranted =
        this.roleDefaultPermissions()[roleId]?.[permissionId]?.value === true;
      const isChecked =
        moduleState[matrixCellKey(roleId, permissionId)] ?? false;

      if (wasGranted && isChecked) {
        categorizedPermissions.defaultPermissions.push(permissionId);
      } else if (wasGranted && !isChecked) {
        categorizedPermissions.revokedPermissions.push(permissionId);
      } else if (!wasGranted && isChecked) {
        categorizedPermissions.newPermissions.push(permissionId);
      }
    });

    return categorizedPermissions;
  }
}
