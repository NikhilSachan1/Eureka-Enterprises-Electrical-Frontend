import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IPetroCardLinkUIFormDto } from '../../types/petro-card.dto';

const LINK_PETRO_CARD_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IPetroCardLinkUIFormDto> =
  {
    cardNumber: {
      fieldType: EDataType.SELECT,
      id: 'cardNumber',
      fieldName: 'cardNumber',
      label: 'Select Petro Card',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PETRO_CARD,
          dropdownName: CONFIGURATION_KEYS.PETRO_CARD.PETRO_CARD_LIST,
        },
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { sourceComponent, actionType } = context;
            // Only required when linking from vehicle component (not for unlink)
            return (
              sourceComponent === 'vehicle' &&
              actionType !== EButtonActionType.UNLINK
            );
          },
          validators: [Validators.required],
        },
      ],
    },
    vehicleName: {
      fieldType: EDataType.SELECT,
      id: 'vehicleName',
      fieldName: 'vehicleName',
      label: 'Select Vehicle',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
        },
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { sourceComponent, actionType } = context;
            return (
              sourceComponent === 'petro-card' &&
              actionType !== EButtonActionType.UNLINK
            );
          },
          validators: [Validators.required],
        },
      ],
    },
  };

const LINK_PETRO_CARD_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Link Petro Card',
    tooltip: 'Link a petro card to a vehicle',
  },
};

export const LINK_PETRO_CARD_FORM_CONFIG: IFormConfig<IPetroCardLinkUIFormDto> =
  {
    fields: LINK_PETRO_CARD_FORM_FIELDS_CONFIG,
    buttons: LINK_PETRO_CARD_FORM_BUTTONS_CONFIG,
  };
