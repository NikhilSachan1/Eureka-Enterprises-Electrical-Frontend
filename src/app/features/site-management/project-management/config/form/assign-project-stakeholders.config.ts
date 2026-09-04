import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { AddVendorComponent } from '@features/site-management/vendor-management/components/add-vendor/add-vendor.component';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { IProjectAssignStakeholdersFormDto } from '../../types/project.dto';

const ASSIGN_PROJECT_STAKEHOLDERS_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IProjectAssignStakeholdersFormDto> =
  {
    vendorNames: {
      id: 'vendorNames',
      fieldName: 'vendorNames',
      label: 'Vendor Names',
      fieldType: EDataType.MULTI_SELECT,
      allowCreate: {
        component: AddVendorComponent,
        actionLabel: 'Add vendor',
        header: 'Add Vendor',
        subtitle: 'Add a new vendor',
        permission: APP_PERMISSION.VENDOR.ADD,
      },
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VENDOR,
          dropdownName: CONFIGURATION_KEYS.VENDOR.VENDOR_LIST,
        },
      },
    },
  };

export const ASSIGN_PROJECT_STAKEHOLDERS_FORM_CONFIG: IFormConfig<IProjectAssignStakeholdersFormDto> =
  {
    fields: ASSIGN_PROJECT_STAKEHOLDERS_FORM_FIELDS_CONFIG,
  };
