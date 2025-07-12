import { Component, signal, inject, OnInit, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { NavTabsComponent } from '../../../../../shared/components/nav-tabs/nav-tabs.component';
import { InputFieldComponent } from '../../../../../shared/components/input-field/input-field.component';
import { StandaloneInputFieldComponent } from '../../../../../shared/components/standalone-input-field/standalone-input-field.component';
import { ICONS } from '../../../../../shared/constants';
import { ETabMode, EFieldType } from '../../../../../shared/types';
import { IEnhancedForm, ITabChange, ITabItem, IFormInputFieldsConfig, IInputFieldsConfig } from '../../../../../shared/models';
import { MODULES_NAME_DATA } from '../../../../../shared/config/static-data.config';
import { SystemPermissionService } from '../../system-permission-management/services/system-permission.service';
import { IModulePermission } from '../../system-permission-management/models/system-permission.model';
import { LoadingService, FormService, InputFieldConfigService } from '../../../../../shared/services';
import { SET_PERMISSION_FORM_CONFIG } from './set-permission-form.config';
import { ButtonComponent } from "../../../../../shared/components/button/button.component";
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-set-permission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NavTabsComponent, 
    ButtonComponent, 
    CardModule,
    InputFieldComponent,
    StandaloneInputFieldComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './set-permission.component.html',
  styleUrls: ['./set-permission.component.scss']
})
export class SetPermissionComponent implements OnInit {

  
  icons = ICONS;
  tabModeType = ETabMode.CONTENT;
  protected form!: IEnhancedForm;
  readonly defaultPermissionSelected = input<{ [key: string]: boolean }>({});

  protected standaloneInputFieldConfig = signal<Record<string, IInputFieldsConfig>>({});
  protected modulePermissions = signal<IModulePermission[]>([]);
  protected selectAllValues = signal<{ [key: string]: boolean }>({});
  protected readonly activeTabIndex = signal(0);
  protected readonly isSubmitting = signal(false);
  protected tabs = signal(this.getTabs());
  
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly loadingService = inject(LoadingService);
  private readonly formService = inject(FormService);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  globalStats = signal([
    { label: 'Total', value: 0, colorClass: 'text-gray-600' },
    { label: 'Granted', value: 0, colorClass: 'text-emerald-600' },
    { label: 'Revoked', value: 0, colorClass: 'text-red-600' },
    { label: 'New', value: 0, colorClass: 'text-blue-600' }
  ]);

  ngOnInit(): void {
    this.loadModulePermissions();
  }

  onTabChanged(event: ITabChange): void {
    this.activeTabIndex.set(event.index);
  }

  private getTabs(): ITabItem[] {
    const modules = MODULES_NAME_DATA;
    return modules.map((module, index) => ({
      route: `tab-${index}`,
      label: module.label,
      icon: this.icons.SECURITY.SHIELD,
      badge: `10/20`,
      tooltip: `Set permissions for ${module.label}`,
    }));
  }

  private loadModulePermissions(): void {
    this.loadingService.show({
      title: 'Loading module permissions...',
      message: 'Please wait while we load the module permissions...',
    });

    this.systemPermissionService.getSystemPermissionModuleWise().subscribe({
      next: (modules) => {
        this.modulePermissions.set(modules);
        this.prepareDynamicPermissionFormInputFieldsConfig(modules);
      },
      error: () => {
        this.loadingService.hide();
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  }

  private prepareDynamicPermissionFormInputFieldsConfig(modules: IModulePermission[]): void {
    const dynamicFields: IFormInputFieldsConfig = {};
    const standaloneInputFieldConfig: IFormInputFieldsConfig = {};

    modules.forEach((module) => {

      standaloneInputFieldConfig[module.id] = {
        fieldType: EFieldType.Checkbox,
        fieldName: module.id,
        id: module.id,
        checkboxConfig: {
          options: [{
            label: '',
            value: 'select-all'
          }]
        },
      };

      module.permissions.forEach((permission) => {
        if (permission.id) {
          const fieldName = `${module.id}_${permission.id}`;
          dynamicFields[fieldName] = {
            fieldType: EFieldType.Checkbox,
            fieldName: fieldName,
            id: fieldName,
            checkboxConfig: {
              binary: true,
              options: [{
                label: '',
                value: permission.id
              }]
            }
          };
        }
      });
    });

    const finalSetPermissionFormConfig = {
      ...SET_PERMISSION_FORM_CONFIG,
      fields: dynamicFields,
    };

    this.form = this.formService.createForm(finalSetPermissionFormConfig, this.defaultPermissionSelected());
    const fullStandaloneInputFieldConfig = this.inputFieldConfigService.initializeFieldConfigs(standaloneInputFieldConfig);
    this.standaloneInputFieldConfig.set(fullStandaloneInputFieldConfig);

    modules.forEach((module) => {
      this.checkAndUpdateSelectAll(module.id);
    });
  }

  protected onSubmit(): void {    
    const formData = this.form.getData();
    console.log(formData);
    const groupedData = this.groupPermissionsByModule(formData);
    console.log(groupedData);
  }

  private groupPermissionsByModule(formData: any): { [key: string]: string[] } {

    const allModuleIds = [...new Set(
      Object.keys(formData)
        .filter(fieldName => fieldName.includes('_'))
        .map(fieldName => fieldName.split('_')[0])
    )];

    const initialGrouped = allModuleIds.reduce((acc, moduleId) => {
      acc[moduleId] = [];
      return acc;
    }, {} as { [key: string]: string[] });

    return Object.entries(formData)
      .filter(([fieldName, value]) => fieldName.includes('_') && value === true)
      .map(([fieldName]) => {
        const [moduleId, permissionId] = fieldName.split('_');
        return { moduleId, permissionId };
      })
      .reduce((grouped, { moduleId, permissionId }) => {
        grouped[moduleId].push(permissionId);
        return grouped;
      }, initialGrouped);
  }

  protected onReset(): void {
    this.form?.reset();
  }

  protected onClickPermissionCard(moduleId: string, permissionId: string): void {
    const fieldName = `${moduleId}_${permissionId}`;
    const control = this.form.formGroup.get(fieldName);
    
    if (control) {
      const currentValue = control.value;
      control.setValue(!currentValue);
      
      this.checkAndUpdateSelectAll(moduleId);
    }
  }

  protected checkAndUpdateSelectAll(moduleId: string): void {
    const module = this.modulePermissions().find(m => m.id === moduleId);
    if (!module) return;

    const allChecked = module.permissions.every(permission => {
      const fieldName = `${moduleId}_${permission.id}`;
      const control = this.form.formGroup.get(fieldName);
      return control && control.value === true;
    });

    this.updateSelectAllButton(moduleId, allChecked);
  }

  protected selectAllPermissions(moduleId: string, checked: boolean): void {
    const formGroup = this.form.formGroup;
    const module = this.modulePermissions().find(m => m.id === moduleId);
    if (!module) return;
  
    module.permissions.forEach(permission => {
      const controlName = `${moduleId}_${permission.id}`;
      const control = formGroup.get(controlName);
      if (control) {
        control.setValue(checked);
      }
    });

    this.updateSelectAllButton(moduleId, checked);
  }

  private updateSelectAllButton(moduleId: string, checked: boolean): void {
    this.selectAllValues.update(current => ({
      ...current,
      [moduleId]: checked
    }));
  }
}