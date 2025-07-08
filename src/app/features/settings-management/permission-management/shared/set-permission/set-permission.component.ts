import { Component, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { NavTabsComponent } from '../../../../../shared/components/nav-tabs/nav-tabs.component';
import { ICONS } from '../../../../../shared/constants';
import { ETabMode, EFieldType } from '../../../../../shared/types';
import { IEnhancedForm, ITabChange, ITabItem, IFormInputFieldsConfig } from '../../../../../shared/models';
import { MODULES_NAME_DATA } from '../../../../../shared/config/static-data.config';
import { SystemPermissionService } from '../../system-permission-management/services/system-permission.service';
import { IModulePermission } from '../../system-permission-management/models/system-permission.model';
import { LoadingService, FormService } from '../../../../../shared/services';
import { SET_PERMISSION_FORM_CONFIG } from './set-permission-form.config';
import { ButtonComponent } from "../../../../../shared/components/button/button.component";
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-set-permission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NavTabsComponent, 
    ButtonComponent, 
    CardModule,
    CheckboxModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './set-permission.component.html',
  styleUrls: ['./set-permission.component.scss']
})
export class SetPermissionComponent implements OnInit {
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly loadingService = inject(LoadingService);
  private readonly formService = inject(FormService);

  icons = ICONS;
  tabModeType = ETabMode.CONTENT;

  protected form!: IEnhancedForm;
  protected modulePermissions = signal<IModulePermission[]>([]);
  protected moduleSelectAll = signal<{ [key: string]: boolean }>({});

  protected readonly activeTabIndex = signal(0);
  protected readonly isSubmitting = signal(false);
  protected tabs = signal(this.getTabs());

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

    modules.forEach((module) => {
      dynamicFields[module.id] = {
        fieldType: EFieldType.Checkbox,
        fieldName: module.id,
        id: module.id,
        checkboxConfig: {
          binary: false,
          options: module.permissions
            .filter(permission => permission.id)
            .map(permission => ({
              label: '',
              value: permission.id
            }))
        }
      };
    });

    const finalSetPermissionFormConfig = {
      ...SET_PERMISSION_FORM_CONFIG,
      fields: dynamicFields,
    };
    this.form = this.formService.createForm(finalSetPermissionFormConfig);
  }

  protected onSubmit(): void {    
    const formData = this.form.getData();
    console.log(formData);
  }

  protected onReset(): void {
    this.form?.reset();
  }
}