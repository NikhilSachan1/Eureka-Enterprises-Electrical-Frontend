import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { ICONS } from '@shared/constants';
import {
  EButtonSeverity,
  EButtonVariant,
  ETabLayout,
  ETabMode,
  ETabTier,
  IButtonConfig,
  ITabChange,
  ITabItem,
} from '@shared/types';
import { LoadingService } from '@shared/services';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import { toTitleCase } from '@shared/utility';
import { LoggerService } from '@core/services';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IModulePermission } from '../../../sub-features/system-permission-management/types/system-permission.interface';
import { SystemPermissionService } from '../../../sub-features/system-permission-management/services/system-permission.service';
import {
  ICategorizedPermissions,
  IDefaultPermissions,
  IPermissionSaveEvent,
  IMatrixRolePermissionUpdate,
  IPermissionColumnSummary,
  IRolePermissionMatrixColumn,
} from '../../types/set-permission.interface';

type ModulePermissionEntry = IModulePermission['permissions'][number];

/** A module together with the permissions left visible by the active filters. */
interface IModuleView {
  module: IModulePermission;
  permissions: ModulePermissionEntry[];
}

type MatrixState = Record<string, boolean>;

/**
 * Below this width the side-by-side layout no longer fits, so modules and roles
 * become tabs and one role is edited at a time. Matches the stylesheet breakpoint.
 */
const COMPACT_VIEWPORT_MAX_WIDTH = 1023;

function cellKey(columnId: string, permissionId: string): string {
  return `${columnId}:${permissionId}`;
}

@Component({
  selector: 'app-set-permission',
  standalone: true,
  imports: [
    FormsModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TooltipModule,
    ButtonComponent,
    EmptyMessagesComponent,
    NavTabsComponent,
    TextCasePipe,
    NgTemplateOutlet,
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
  protected readonly contentTabMode = ETabMode.CONTENT;
  protected readonly horizontalTabLayout = ETabLayout.HORIZONTAL;
  protected readonly verticalTabLayout = ETabLayout.VERTICAL;
  protected readonly secondaryTabTier = ETabTier.SECONDARY;

  readonly roleColumns = input<IRolePermissionMatrixColumn[]>([]);
  readonly roleDefaultPermissions = input<Record<string, IDefaultPermissions>>(
    {}
  );
  readonly isUserPermissionMode = input<boolean>(false);
  readonly isSubmitting = input<boolean>(false);

  readonly permissionSave = output<IPermissionSaveEvent>();

  protected readonly loadingState = this.loadingService.loadingState;

  protected readonly modulePermissions = signal<IModulePermission[]>([]);
  protected readonly matrixState = signal<MatrixState>({});
  protected readonly selectedModuleId = signal<string>('');
  protected readonly searchTerm = signal<string>('');
  protected readonly showChangedOnly = signal<boolean>(false);
  /** Only used on compact viewports, where columns are edited one at a time. */
  protected readonly selectedColumnId = signal<string>('');
  protected readonly isCompactViewport = signal(
    window.innerWidth <= COMPACT_VIEWPORT_MAX_WIDTH
  );

  private readonly matrixInitialized = signal(false);

  @HostListener('window:resize')
  protected onViewportResize(): void {
    this.isCompactViewport.set(window.innerWidth <= COMPACT_VIEWPORT_MAX_WIDTH);
  }

  private readonly permissionIdsByModule = computed(() =>
    this.modulePermissions().reduce<Record<string, string[]>>((acc, module) => {
      acc[module.id] = this.toPermissionIds(module.permissions);
      return acc;
    }, {})
  );

  private readonly normalizedSearch = computed(() =>
    this.searchTerm().trim().toLowerCase()
  );

  /** Pending cell count per module, always over the full module (never filtered). */
  protected readonly modulePendingCounts = computed(() => {
    const state = this.matrixState();
    const columns = this.roleColumns();

    return Object.entries(this.permissionIdsByModule()).reduce<
      Record<string, number>
    >((acc, [moduleId, permissionIds]) => {
      acc[moduleId] = columns.reduce(
        (count, column) =>
          count +
          permissionIds.filter(permissionId =>
            this.isPending(column.id, permissionId, state)
          ).length,
        0
      );
      return acc;
    }, {});
  });

  protected readonly globalPendingCount = computed(() =>
    Object.values(this.modulePendingCounts()).reduce(
      (sum, count) => sum + count,
      0
    )
  );

  private readonly moduleViews = computed<IModuleView[]>(() => {
    const term = this.normalizedSearch();
    const changedOnly = this.showChangedOnly();
    // Only a changed-only filter depends on the grid, so a plain toggle does not rebuild it.
    const state = changedOnly ? this.matrixState() : null;
    const columns = this.roleColumns();

    return this.modulePermissions().reduce<IModuleView[]>((acc, module) => {
      const moduleNameMatches =
        !term || module.moduleName.toLowerCase().includes(term);

      const permissions = module.permissions.filter(permission => {
        if (!permission.id) {
          return false;
        }
        if (!moduleNameMatches && !this.matchesSearch(permission, term)) {
          return false;
        }
        if (
          changedOnly &&
          state !== null &&
          !columns.some(column =>
            this.isPending(column.id, permission.id as string, state)
          )
        ) {
          return false;
        }
        return true;
      });

      if (permissions.length) {
        acc.push({ module, permissions });
      }

      return acc;
    }, []);
  });

  /** Falls back to the first visible module so filtering never leaves an empty pane. */
  protected readonly activeModuleView = computed<IModuleView | undefined>(
    () => {
      const views = this.moduleViews();
      const selectedId = this.selectedModuleId();

      return views.find(view => view.module.id === selectedId) ?? views[0];
    }
  );

  protected readonly activeModuleId = computed(
    () => this.activeModuleView()?.module.id ?? ''
  );

  protected readonly activeModulePendingCount = computed(
    () => this.modulePendingCounts()[this.activeModuleId()] ?? 0
  );

  protected readonly columnSummaries = computed<IPermissionColumnSummary[]>(
    () => {
      const view = this.activeModuleView();
      if (!view) {
        return [];
      }

      const state = this.matrixState();
      const permissionIds = this.toPermissionIds(view.permissions);

      return this.roleColumns().map(column => {
        const granted = permissionIds.filter(
          permissionId => state[cellKey(column.id, permissionId)]
        ).length;
        const pending = permissionIds.filter(permissionId =>
          this.isPending(column.id, permissionId, state)
        ).length;

        return {
          id: column.id,
          label: column.label,
          total: permissionIds.length,
          granted,
          pending,
          allGranted:
            permissionIds.length > 0 && granted === permissionIds.length,
        };
      });
    }
  );

  protected readonly isSingleColumnMode = computed(
    () => this.roleColumns().length === 1
  );

  /** The column being edited on a compact viewport; falls back to the first one. */
  protected readonly activeColumnSummary = computed<
    IPermissionColumnSummary | undefined
  >(() => {
    const summaries = this.columnSummaries();
    const selectedId = this.selectedColumnId();

    return summaries.find(summary => summary.id === selectedId) ?? summaries[0];
  });

  protected readonly moduleTabs = computed<ITabItem[]>(() => {
    const singleColumn = this.isSingleColumnMode();
    const pendingCounts = this.modulePendingCounts();
    const columnId = singleColumn ? this.roleColumns()[0]?.id : undefined;
    const state = columnId ? this.matrixState() : null;

    return this.moduleViews().map(({ module, permissions }) => {
      const permissionIds = this.toPermissionIds(permissions);
      const pendingCount = pendingCounts[module.id] ?? 0;
      const grantedCount =
        state && columnId
          ? permissionIds.filter(permissionId =>
              state[cellKey(columnId, permissionId)]
            ).length
          : 0;

      return {
        route: module.id,
        label: toTitleCase(module.moduleName),
        badge: pendingCount > 0 ? pendingCount : undefined,
        tooltip: singleColumn
          ? `${grantedCount} of ${permissionIds.length} granted`
          : `${permissionIds.length} permissions`,
      };
    });
  });

  protected readonly roleTabs = computed<ITabItem[]>(() =>
    this.columnSummaries().map(summary => ({
      route: summary.id,
      label: toTitleCase(summary.label),
      badge: summary.pending > 0 ? summary.pending : undefined,
      tooltip: `${summary.granted} of ${summary.total} granted`,
    }))
  );

  protected readonly saveButtonConfig = computed<Partial<IButtonConfig>>(() => {
    const pendingCount = this.globalPendingCount();

    return {
      label: pendingCount ? `Save ${pendingCount} Changes` : 'Save Changes',
      icon: ICONS.COMMON.CHECK_TICK,
      severity: EButtonSeverity.PRIMARY,
      actionName: 'save',
      disabled: pendingCount === 0 || this.isSubmitting(),
      disabledTooltip: 'Toggle a permission to enable saving.',
    };
  });

  protected readonly discardButtonConfig = computed<Partial<IButtonConfig>>(
    () => ({
      label: 'Discard All',
      icon: ICONS.ACTIONS.TIMES,
      severity: EButtonSeverity.SECONDARY,
      variant: EButtonVariant.OUTLINED,
      actionName: 'discard',
      disabled: this.globalPendingCount() === 0 || this.isSubmitting(),
      tooltip: 'Revert every unsaved change back to the saved permissions.',
      disabledTooltip: 'There are no unsaved changes to discard.',
    })
  );

  protected readonly changedOnlyButtonConfig = computed<Partial<IButtonConfig>>(
    () => {
      const active = this.showChangedOnly();

      return {
        label: 'Changed Only',
        icon: ICONS.COMMON.FILTER,
        severity: active ? EButtonSeverity.WARNING : EButtonSeverity.SECONDARY,
        variant: active ? undefined : EButtonVariant.OUTLINED,
        actionName: 'toggleChangedOnly',
        tooltip: active
          ? 'Showing only permissions you changed'
          : 'Show only permissions you changed',
      };
    }
  );

  constructor() {
    effect(() => {
      if (this.matrixInitialized()) {
        return;
      }

      const modules = this.modulePermissions();
      const columns = this.roleColumns();
      const defaults = this.roleDefaultPermissions();

      if (!modules.length || !columns.length || !Object.keys(defaults).length) {
        return;
      }

      this.resetMatrixState();
      this.selectedModuleId.set(modules[0]?.id ?? '');
      this.selectedColumnId.set(columns[0]?.id ?? '');
      this.matrixInitialized.set(true);
    });
  }

  ngOnInit(): void {
    this.loadModulePermissions();
  }

  protected onModuleTabChange(change: ITabChange): void {
    this.selectedModuleId.set(change.tab.route);
  }

  protected onRoleTabChange(change: ITabChange): void {
    this.selectedColumnId.set(change.tab.route);
  }

  protected isGranted(columnId: string, permissionId: string): boolean {
    return this.matrixState()[cellKey(columnId, permissionId)] ?? false;
  }

  protected isCellChanged(columnId: string, permissionId: string): boolean {
    return this.isPending(columnId, permissionId, this.matrixState());
  }

  /** Compact rows are tapped as a whole, so the row owns the flip. */
  protected onCompactRowToggle(columnId: string, permissionId: string): void {
    if (this.isSubmitting()) {
      return;
    }

    this.onPermissionToggle(
      columnId,
      permissionId,
      !this.isGranted(columnId, permissionId)
    );
  }

  protected onPermissionToggle(
    columnId: string,
    permissionId: string,
    granted: boolean
  ): void {
    this.matrixState.update(state => ({
      ...state,
      [cellKey(columnId, permissionId)]: granted,
    }));
  }

  /** Grants or revokes every visible permission of the open module for one column. */
  protected onColumnToggle(columnId: string, granted: boolean): void {
    const view = this.activeModuleView();
    if (!view || this.isSubmitting()) {
      return;
    }

    const permissionIds = this.toPermissionIds(view.permissions);

    this.matrixState.update(state =>
      permissionIds.reduce<MatrixState>(
        (acc, permissionId) => {
          acc[cellKey(columnId, permissionId)] = granted;
          return acc;
        },
        { ...state }
      )
    );
  }

  protected getPermissionSource(
    permissionId: string
  ): 'override' | 'role' | undefined {
    const [column] = this.roleColumns();
    if (!column) {
      return undefined;
    }

    return this.roleDefaultPermissions()[column.id]?.[permissionId]?.source;
  }

  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  protected onToolbarAction(actionName: string): void {
    if (actionName === 'save') {
      this.saveAllChanges();
    } else if (actionName === 'discard') {
      this.resetMatrixState();
    } else if (actionName === 'toggleChangedOnly') {
      this.showChangedOnly.update(active => !active);
    }
  }

  /** One request per column carrying the delta across every module. */
  private saveAllChanges(): void {
    const state = this.matrixState();
    const permissionIdsByModule = this.permissionIdsByModule();
    const allPermissionIds = Object.values(permissionIdsByModule).flat();

    const roleUpdates = this.roleColumns().reduce<
      IMatrixRolePermissionUpdate[]
    >((acc, column) => {
      const categorizedPermissions = this.categorizeChanges(
        column.id,
        allPermissionIds,
        state
      );

      if (
        categorizedPermissions.newPermissions.length ||
        categorizedPermissions.revokedPermissions.length
      ) {
        acc.push({ roleId: column.id, categorizedPermissions });
      }

      return acc;
    }, []);

    if (!roleUpdates.length) {
      return;
    }

    this.permissionSave.emit({ roleUpdates });
  }

  private categorizeChanges(
    columnId: string,
    permissionIds: string[],
    state: MatrixState
  ): ICategorizedPermissions {
    return permissionIds.reduce<ICategorizedPermissions>(
      (acc, permissionId) => {
        if (this.isPending(columnId, permissionId, state)) {
          const target = state[cellKey(columnId, permissionId)]
            ? acc.newPermissions
            : acc.revokedPermissions;
          target.push(permissionId);
        }

        return acc;
      },
      { defaultPermissions: [], revokedPermissions: [], newPermissions: [] }
    );
  }

  private isPending(
    columnId: string,
    permissionId: string,
    state: MatrixState
  ): boolean {
    const key = cellKey(columnId, permissionId);
    const wasGranted =
      this.roleDefaultPermissions()[columnId]?.[permissionId]?.value === true;

    return wasGranted !== (state[key] ?? false);
  }

  private resetMatrixState(): void {
    const defaults = this.roleDefaultPermissions();
    const columns = this.roleColumns();

    const state = this.modulePermissions()
      .flatMap(module => this.toPermissionIds(module.permissions))
      .reduce<MatrixState>((acc, permissionId) => {
        columns.forEach(column => {
          acc[cellKey(column.id, permissionId)] =
            defaults[column.id]?.[permissionId]?.value ?? false;
        });
        return acc;
      }, {});

    this.matrixState.set(state);
  }

  private matchesSearch(
    permission: ModulePermissionEntry,
    term: string
  ): boolean {
    return [permission.label, permission.name, permission.description].some(
      value => value?.toLowerCase().includes(term)
    );
  }

  private toPermissionIds(permissions: ModulePermissionEntry[]): string[] {
    return permissions
      .map(permission => permission.id)
      .filter((id): id is string => Boolean(id));
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
}
