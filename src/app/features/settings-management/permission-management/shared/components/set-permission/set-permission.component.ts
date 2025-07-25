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
import { MessageService, ConfirmationService } from 'primeng/api';
import {
  NavTabsComponent,
  InputFieldComponent,
  StandaloneInputFieldComponent,
  EmptyMessagesComponent,
  ButtonComponent,
} from '@shared/components';
import { ICONS } from '@shared/constants';
import { ETabMode, EFieldType, EPrimeNGSeverity } from '@shared/types';
import {
  IEnhancedForm,
  ITabChange,
  IFormInputFieldsConfig,
  IInputFieldsConfig,
  ITabItem,
} from '@shared/models';
import { MODULES_NAME_DATA } from '@shared/config';
import {
  LoadingService,
  FormService,
  InputFieldConfigService,
} from '@shared/services';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { NgClass } from '@angular/common';
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

@Component({
  selector: 'app-set-permission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NavTabsComponent,
    ButtonComponent,
    CardModule,
    TagModule,
    InputFieldComponent,
    StandaloneInputFieldComponent,
    NgClass,
    EmptyMessagesComponent,
  ],
  providers: [MessageService, ConfirmationService],
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
  tabModeType = ETabMode.CONTENT;

  protected form!: IEnhancedForm;

  protected tabs = computed(() => this.getTabs());
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
  protected readonly activeTabIndex = signal(0);
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
    const formData = this.form.getData() as Record<string, boolean>;
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

    const dynamicFields: IFormInputFieldsConfig = {};
    const standaloneInputFieldConfig: IFormInputFieldsConfig = {};

    modules.forEach(module => {
      standaloneInputFieldConfig[module.id] = {
        fieldType: EFieldType.Checkbox,
        fieldName: module.id,
        id: module.id,
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
            fieldType: EFieldType.Checkbox,
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

    this.form = this.formService.createForm(
      finalSetPermissionFormConfig,
      formInitialValues
    );
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
    const initialGrouped = modules.reduce(
      (acc, module) => {
        acc[module.id] = [];
        return acc;
      },
      {} as Record<string, string[]>
    );

    return Object.entries(formData)
      .filter(([, value]) => value === true)
      .reduce((grouped, [fieldName]) => {
        const module = modules.find(m =>
          m.permissions.some(p => p.id === fieldName)
        );

        if (module) {
          grouped[module.id].push(fieldName);
        }

        return grouped;
      }, initialGrouped);
  }

  onTabChanged(event: ITabChange): void {
    this.activeTabIndex.set(event.index);
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
      this.onPermissionChange();
    }
  }

  protected selectAllPermissions(moduleId: string, checked: unknown): void {
    const { formGroup } = this.form;
    const module = this.modulePermissions().find(m => m.id === moduleId);
    if (!module) {
      return;
    }

    module.permissions.forEach(permission => {
      const controlName = `${permission.id}`;
      const control = formGroup.get(controlName);
      if (control) {
        control.setValue(checked as boolean);
      }
    });
    this.onPermissionChange();
  }

  protected onPermissionChange(): void {
    this.formChangeTrigger.update(prev => prev + 1);
  }

  private getTabs(): ITabItem[] {
    const modules = MODULES_NAME_DATA;
    const modulePermissions = this.modulePermissions();
    const stats = this.getStats();

    return modules.map((module, index) => {
      const actualModule = modulePermissions.find(
        m => m.moduleName === module.label
      ) as IModulePermission;
      const moduleStats = stats.modules[actualModule.id];

      const granted =
        moduleStats.find(stat => stat.label === 'Granted')?.value ?? 0;
      const newCount =
        moduleStats.find(stat => stat.label === 'New')?.value ?? 0;
      const revoked =
        moduleStats.find(stat => stat.label === 'Revoked')?.value ?? 0;
      const total =
        moduleStats.find(stat => stat.label === 'Total')?.value ?? 0;

      const netEffective = granted + newCount - revoked;

      return {
        route: `tab-${index}`,
        label: module.label,
        icon: this.icons.SECURITY.SHIELD,
        badge: `${netEffective}/${total}`,
        tooltip: `Set permissions for ${module.label}`,
      };
    });
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

      const moduleStatsArray = [
        { label: 'Total', value: moduleTotal, colorClass: 'text-gray-600' },
        {
          label: 'Granted',
          value: moduleGranted,
          colorClass: 'text-emerald-600',
        },
        { label: 'Revoked', value: moduleRevoked, colorClass: 'text-red-600' },
        { label: 'New', value: moduleNew, colorClass: 'text-blue-600' },
      ];

      if (this.isUserPermissionComponent()) {
        moduleStatsArray.push({
          label: 'Overrides',
          value: moduleOverride,
          colorClass: 'text-purple-600',
        });
      }

      moduleStats[module.id] = moduleStatsArray;
    });

    const globalStatsArray = [
      { label: 'Total', value: globalTotal, colorClass: 'text-gray-600' },
      {
        label: 'Granted',
        value: globalGranted,
        colorClass: 'text-emerald-600',
      },
      { label: 'Revoked', value: globalRevoked, colorClass: 'text-red-600' },
      { label: 'New', value: globalNew, colorClass: 'text-blue-600' },
    ];

    if (this.isUserPermissionComponent()) {
      globalStatsArray.push({
        label: 'Overrides',
        value: globalOverride,
        colorClass: 'text-purple-600',
      });
    }

    const globalStats = globalStatsArray;

    return {
      global: globalStats,
      modules: moduleStats,
    };
  }

  private getPendingCounts(): IPermissionStats {
    const stats = this.getStats();

    const globalRevoked =
      stats.global.find(stat => stat.label === 'Revoked')?.value ?? 0;
    const globalNew =
      stats.global.find(stat => stat.label === 'New')?.value ?? 0;
    const globalPending = globalRevoked + globalNew;
    const globalPendingStats = [
      {
        label: 'Pending',
        value: globalPending,
        colorClass: 'text-yellow-600',
      },
    ];

    const modulePendingStats: Record<string, IModuleStats[]> = {};
    Object.keys(stats.modules).forEach(moduleId => {
      const moduleStats = stats.modules[moduleId];
      const revoked =
        moduleStats.find(stat => stat.label === 'Revoked')?.value ?? 0;
      const newCount =
        moduleStats.find(stat => stat.label === 'New')?.value ?? 0;
      const pendingCount = revoked + newCount;

      modulePendingStats[moduleId] = [
        {
          label: 'Pending',
          value: pendingCount,
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
      cardStyle: 'border-gray-300',
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

  protected getBadgeSeverity(label: string): EPrimeNGSeverity {
    switch (label) {
      case 'Granted':
        return 'success';
      case 'Revoked':
        return 'danger';
      case 'New':
        return 'info';
      case 'Not Granted':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  protected onReset(): void {
    const defaultPermissions = this.defaultPermissionSelected();
    const formInitialValues =
      this.convertToSimpleBooleanValues(defaultPermissions);
    this.form.reset(formInitialValues);
    this.onPermissionChange();
  }

  public hasUnsavedChanges(): boolean {
    if (this.form?.formGroup?.dirty) {
      this.logger.info('Set Permission Component: Form has unsaved changes');
      return false;
    }

    this.logger.info('Set Permission Component: Form has no unsaved changes');
    return true;
  }
}
