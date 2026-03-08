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
  Signal,
  DestroyRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ICONS } from '@shared/constants';
import {
  EDataType,
  EButtonSeverity,
  EButtonVariant,
  IButtonConfig,
  IEnhancedForm,
  IFormInputFieldsConfig,
  IInputFieldsConfig,
} from '@shared/types';
import {
  LoadingService,
  FormService,
  InputFieldConfigService,
} from '@shared/services';
import { CardModule } from 'primeng/card';
import { NgClass } from '@angular/common';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { IModulePermission } from '../../../sub-features/system-permission-management/types/system-permission.interface';
import { SystemPermissionService } from '../../../sub-features/system-permission-management/services/system-permission.service';
import { ROLE_PERMISSION_FORM_SET_CONFIG } from '../../config/form/set-permission-form.config';
import {
  ISetPermissionData,
  IModuleStats,
  IPermissionCard,
  ICategorizedPermissions,
  IPermissionStats,
  IDefaultPermissions,
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
  OVERRIDES: 'Overrides',
  PENDING: 'Pending',
} as const;

function buildStatsArray(
  total: number,
  granted: number,
  revoked: number,
  newCount: number,
  includeOverrides?: number
): IModuleStats[] {
  const arr: IModuleStats[] = [
    {
      label: STAT_LABEL.TOTAL,
      value: total,
      colorClass: 'text-content-secondary',
    },
    {
      label: STAT_LABEL.GRANTED,
      value: granted,
      colorClass: 'text-emerald-600',
    },
    { label: STAT_LABEL.REVOKED, value: revoked, colorClass: 'text-red-600' },
    { label: STAT_LABEL.NEW, value: newCount, colorClass: 'text-blue-600' },
  ];
  if (includeOverrides !== undefined) {
    arr.push({
      label: STAT_LABEL.OVERRIDES,
      value: includeOverrides,
      colorClass: 'text-purple-600',
    });
  }
  return arr;
}

@Component({
  selector: 'app-set-permission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AccordionModule,
    ButtonComponent,
    CardModule,
    InputFieldComponent,
    NgClass,
    EmptyMessagesComponent,
    StatusTagComponent,
    TextCasePipe,
  ],
  templateUrl: './set-permission.component.html',
  styleUrls: ['./set-permission.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetPermissionComponent implements OnInit {
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly loadingService = inject(LoadingService);
  private readonly formService = inject(FormService);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);

  icons = ICONS;

  protected form!: IEnhancedForm<Record<string, boolean>>;

  protected computedSelectAllValues = computed(() => this.selectAllValues());
  protected computedGetStats = computed(() => this.getStats());
  protected computedGetPendingCounts = computed(() => this.getPendingCounts());
  protected computedGetPermissionStatus = (
    permissionId: string
  ): Signal<IPermissionCard> =>
    computed(() => this.getPermissionStatus(permissionId));
  protected standaloneInputFieldConfig = signal<
    Record<string, IInputFieldsConfig>
  >({});
  protected modulePermissions = signal<IModulePermission[]>([]);
  /** For multiple accordion: array of open panel values (e.g. ['0','1','2']) */
  protected readonly activeTabIndex = signal<string[]>([]);

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
  private readonly formChangeTrigger = signal(0);

  readonly defaultPermissionSelected = input<IDefaultPermissions | null>({});
  readonly isUserPermissionComponent = input<boolean>(false);
  readonly isSubmitting = input<boolean>(false);

  readonly modulePermissionsData = output<ISetPermissionData>();

  protected readonly loadingState = this.loadingService.loadingState;

  constructor() {
    effect(() => {
      if (this.isSubmitting()) {
        this.form?.disable();
      } else {
        this.form?.enable();
      }
    });

    effect(() => {
      this.prepareDynamicPermissionFormInputFieldsConfig(
        this.modulePermissions()
      );
    });
  }

  ngOnInit(): void {
    this.loadModulePermissions();
  }

  protected onSubmit(): void {
    const formData = this.form.getData();
    const groupedData = this.groupPermissionsByModule(formData);
    const categorizedPermissionsData = this.getCategorizePermissions(formData);
    this.modulePermissionsData.emit({
      moduleWisePermissions: groupedData,
      categorizedPermissions: categorizedPermissionsData,
    });
  }

  private loadModulePermissions(): void {
    this.loadingService.show({
      title: 'Loading module permissions...',
      message: 'Please wait while we load the module permissions...',
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

  private prepareDynamicPermissionFormInputFieldsConfig(
    modules: IModulePermission[]
  ): void {
    if (modules.length === 0) {
      return;
    }

    const dynamicFields: IFormInputFieldsConfig<Record<string, boolean>> = {};
    const standaloneInputFieldConfig: IFormInputFieldsConfig<
      Record<string, boolean>
    > = {};

    modules.forEach(module => {
      const hasNoPermissions =
        !module.permissions || module.permissions.length === 0;
      standaloneInputFieldConfig[module.id] = {
        fieldType: EDataType.CHECKBOX,
        fieldName: module.id,
        id: module.id,
        disabledInput: hasNoPermissions,
        checkboxConfig: {
          options: [
            {
              label: '',
              value: 'select-all',
            },
          ],
        },
      };

      module.permissions.forEach(permission => {
        if (permission.id) {
          const fieldName = `${permission.id}`;
          dynamicFields[fieldName] = {
            fieldType: EDataType.CHECKBOX,
            fieldName,
            id: fieldName,
            checkboxConfig: {
              binary: true,
              options: [
                {
                  label: '',
                  value: permission.id,
                },
              ],
            },
          };
        }
      });
    });

    const finalSetPermissionFormConfig = {
      ...ROLE_PERMISSION_FORM_SET_CONFIG,
      fields: dynamicFields,
    };

    const defaultPermissions = this.defaultPermissionSelected();
    const formInitialValues =
      this.convertToSimpleBooleanValues(defaultPermissions);

    this.form = this.formService.createForm(finalSetPermissionFormConfig, {
      destroyRef: this.destroyRef,
      defaultValues: formInitialValues,
    });
    const fullStandaloneInputFieldConfig =
      this.inputFieldConfigService.initializeFieldConfigs(
        standaloneInputFieldConfig
      );
    this.standaloneInputFieldConfig.set(fullStandaloneInputFieldConfig);
  }

  private getCategorizePermissions(
    formData: Record<string, boolean>
  ): ICategorizedPermissions {
    const defaultPermissions = this.defaultPermissionSelected() ?? {};
    const defaultPermissionIds: string[] = [];
    const revokedPermissions: string[] = [];
    const newPermissions: string[] = [];

    const allPermissionIds = this.modulePermissions().flatMap(module =>
      module.permissions.map(p => p.id)
    );

    allPermissionIds.forEach(permissionId => {
      const permissionData = defaultPermissions[permissionId];
      const wasOriginallyGranted = permissionData?.value === true;
      const isCurrentlyChecked = formData[permissionId] === true;

      if (wasOriginallyGranted && isCurrentlyChecked) {
        defaultPermissionIds.push(permissionId);
      } else if (wasOriginallyGranted && !isCurrentlyChecked) {
        revokedPermissions.push(permissionId);
      } else if (!wasOriginallyGranted && isCurrentlyChecked) {
        newPermissions.push(permissionId);
      }
    });

    return {
      defaultPermissions: defaultPermissionIds,
      revokedPermissions,
      newPermissions,
    };
  }

  private groupPermissionsByModule(
    formData: Record<string, boolean>
  ): Record<string, string[]> {
    const modules = this.modulePermissions();
    const permissionToModule = new Map<string, string>();
    modules.forEach(module => {
      module.permissions.forEach(p => {
        if (p.id) {
          permissionToModule.set(p.id, module.id);
        }
      });
    });

    const grouped = modules.reduce(
      (acc, m) => {
        acc[m.id] = [];
        return acc;
      },
      {} as Record<string, string[]>
    );

    Object.entries(formData).forEach(([fieldName, value]) => {
      if (value === true) {
        const moduleId = permissionToModule.get(fieldName);
        if (moduleId) {
          grouped[moduleId].push(fieldName);
        }
      }
    });

    return grouped;
  }

  protected onAccordionValueChange(
    value: string | number | string[] | number[] | null | undefined
  ): void {
    if (value === null || value === undefined) {
      return;
    }
    const arr = Array.isArray(value)
      ? value.map(v => (typeof v === 'number' ? String(v) : v))
      : [String(value)];
    this.activeTabIndex.set(arr);
  }

  protected expandAll(): void {
    const modules = this.modulePermissions();
    this.activeTabIndex.set(modules.map((_, i) => String(i)));
  }

  protected collapseAll(): void {
    this.activeTabIndex.set([]);
  }

  protected onAccordionActionClick(actionName: string): void {
    if (actionName === 'expandAll') {
      this.expandAll();
    } else if (actionName === 'collapseAll') {
      this.collapseAll();
    }
  }

  /** Builds badge string (e.g. "2/3") from module stats. Use from template with rowStats to avoid duplicate getStats. */
  protected getModuleBadgeFromStats(stats: IModuleStats[] | undefined): string {
    if (!stats?.length) {
      return '';
    }
    const total = stats.find(s => s.label === STAT_LABEL.TOTAL)?.value ?? 0;
    const granted = stats.find(s => s.label === STAT_LABEL.GRANTED)?.value ?? 0;
    const newCount = stats.find(s => s.label === STAT_LABEL.NEW)?.value ?? 0;
    const revoked = stats.find(s => s.label === STAT_LABEL.REVOKED)?.value ?? 0;
    return `${granted + newCount - revoked}/${total}`;
  }

  protected onClickPermissionCard(
    moduleId: string,
    permissionId: string
  ): void {
    const fieldName = `${permissionId}`;
    const control = this.form.formGroup.get(fieldName);

    if (control) {
      const currentValue = control.value;
      control.setValue(!currentValue);
      control.markAsDirty();
      this.onPermissionChange();
    }
  }

  protected selectAllPermissions(moduleId: string, checked: unknown): void {
    const { formGroup } = this.form;
    const modules = this.modulePermissions();
    const panelIndex = modules.findIndex(m => m.id === moduleId);
    if (panelIndex === -1) {
      return;
    }
    const module = modules[panelIndex];

    const key = String(panelIndex);
    const open = this.activeTabIndex();
    if (!open.includes(key)) {
      this.activeTabIndex.set([...open, key]);
    }

    module.permissions.forEach(permission => {
      const controlName = `${permission.id}`;
      const control = formGroup.get(controlName);
      if (control) {
        control.setValue(checked as boolean);
        control.markAsDirty();
      }
    });
    this.onPermissionChange();
  }

  protected onPermissionChange(): void {
    this.formChangeTrigger.update(prev => prev + 1);
  }

  private selectAllValues(): Record<string, boolean> {
    this.formChangeTrigger();

    const modules = this.modulePermissions();
    const formGroup = this.form?.formGroup;

    if (!formGroup || modules.length === 0) {
      return {};
    }

    const result: Record<string, boolean> = {};

    modules.forEach(module => {
      if (!module.permissions || module.permissions.length === 0) {
        result[module.id] = false;
        return;
      }
      const allChecked = module.permissions.every(permission => {
        const fieldName = `${permission.id}`;
        const control = formGroup.get(fieldName);
        return control && control.value === true;
      });
      result[module.id] = allChecked;
    });

    return result;
  }

  private getStats(): IPermissionStats {
    this.formChangeTrigger();

    const modules = this.modulePermissions();
    const defaultPermissions = this.defaultPermissionSelected();
    const formGroup = this.form?.formGroup;

    let globalTotal = 0;
    let globalGranted = 0;
    let globalRevoked = 0;
    let globalNew = 0;
    let globalOverride = 0;
    const moduleStats: Record<string, IModuleStats[]> = {};

    modules.forEach(module => {
      const moduleTotal = module.permissions.length;
      let moduleGranted = 0;
      let moduleRevoked = 0;
      let moduleNew = 0;
      let moduleOverride = 0;

      module.permissions.forEach(permission => {
        const fieldName = `${permission.id}`;
        const permissionData = defaultPermissions?.[fieldName];
        const wasOriginallyGranted = permissionData?.value === true;
        const isCurrentlyChecked = formGroup?.get(fieldName)?.value === true;
        const isOverride = permissionData?.source === 'override';

        // Count override permissions regardless of their value (true or false)
        if (isOverride) {
          moduleOverride++;
          globalOverride++;
        }

        if (wasOriginallyGranted) {
          moduleGranted++;
          globalGranted++;

          if (!isCurrentlyChecked) {
            moduleRevoked++;
            globalRevoked++;
          }
        } else {
          if (isCurrentlyChecked) {
            moduleNew++;
            globalNew++;
          }
        }
      });

      globalTotal += moduleTotal;

      moduleStats[module.id] = buildStatsArray(
        moduleTotal,
        moduleGranted,
        moduleRevoked,
        moduleNew,
        this.isUserPermissionComponent() ? moduleOverride : undefined
      );
    });

    const globalStats = buildStatsArray(
      globalTotal,
      globalGranted,
      globalRevoked,
      globalNew,
      this.isUserPermissionComponent() ? globalOverride : undefined
    );

    return {
      global: globalStats,
      modules: moduleStats,
    };
  }

  private getPendingCounts(): IPermissionStats {
    const stats = this.computedGetStats();

    const globalRevoked =
      stats.global.find(stat => stat.label === STAT_LABEL.REVOKED)?.value ?? 0;
    const globalNew =
      stats.global.find(stat => stat.label === STAT_LABEL.NEW)?.value ?? 0;
    const globalPendingStats: IModuleStats[] = [
      {
        label: STAT_LABEL.PENDING,
        value: globalRevoked + globalNew,
        colorClass: 'text-yellow-600',
      },
    ];

    const modulePendingStats: Record<string, IModuleStats[]> = {};
    Object.keys(stats.modules).forEach(moduleId => {
      const moduleStats = stats.modules[moduleId];
      const revoked =
        moduleStats.find(stat => stat.label === STAT_LABEL.REVOKED)?.value ?? 0;
      const newCount =
        moduleStats.find(stat => stat.label === STAT_LABEL.NEW)?.value ?? 0;
      modulePendingStats[moduleId] = [
        {
          label: STAT_LABEL.PENDING,
          value: revoked + newCount,
          colorClass: 'text-yellow-600',
        },
      ];
    });

    return {
      global: globalPendingStats,
      modules: modulePendingStats,
    };
  }

  private getPermissionStatus(permissionId: string): IPermissionCard {
    this.formChangeTrigger();

    const defaultPermissions = this.defaultPermissionSelected();
    const formGroup = this.form?.formGroup;

    const fieldName = `${permissionId}`;
    const permissionData = defaultPermissions?.[fieldName];
    const wasOriginallyGranted = permissionData?.value === true;
    const isCurrentlyChecked = formGroup?.get(fieldName)?.value === true;
    const source = permissionData?.source;

    if (wasOriginallyGranted) {
      if (isCurrentlyChecked) {
        return {
          label: 'Granted',
          icon: this.icons.ACTIONS.CHECK,
          cardStyle: 'border-emerald-300',
          source,
        };
      }
      return {
        label: 'Revoked',
        icon: this.icons.ACTIONS.TIMES,
        cardStyle: 'border-red-300',
        source,
      };
    }
    if (isCurrentlyChecked) {
      return {
        label: 'New',
        icon: this.icons.ACTIONS.CHECK_CIRCLE,
        cardStyle: 'border-blue-300',
        source,
      };
    }
    return {
      label: 'Not Granted',
      icon: this.icons.ACTIONS.TIMES,
      cardStyle: 'border-border-medium',
      source,
    };
  }

  private convertToSimpleBooleanValues(
    defaultPermissions: IDefaultPermissions | null
  ): Record<string, boolean> {
    if (!defaultPermissions) {
      return {};
    }

    return Object.entries(defaultPermissions).reduce(
      (acc, [key, permissionData]) => ({
        ...acc,
        [key]: permissionData.value,
      }),
      {} as Record<string, boolean>
    );
  }

  protected onReset(): void {
    const defaultPermissions = this.defaultPermissionSelected();
    const formInitialValues =
      this.convertToSimpleBooleanValues(defaultPermissions);
    this.form.reset(formInitialValues);
    this.onPermissionChange();
  }

  public hasUnsavedChanges(): boolean {
    if (this.form.isDirty()) {
      this.logger.info('Set Permission Component: Form has unsaved changes');
      return true;
    }

    this.logger.info('Set Permission Component: Form has no unsaved changes');
    return false;
  }
}
