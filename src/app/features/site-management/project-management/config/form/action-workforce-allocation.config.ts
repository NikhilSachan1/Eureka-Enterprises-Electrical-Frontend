import { Validators } from '@angular/forms';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

export type IWorkforceAllocationActionFormDto = {
  projectName: string | undefined;
  allocateDate: Date | undefined;
  releaseDate: Date | undefined;
} & Record<string, unknown>;

const isAllocateAction = (context: Record<string, unknown>): boolean =>
  context['actionType'] === EButtonActionType.ALLOCATE;

const isDeallocateAction = (context: Record<string, unknown>): boolean =>
  context['actionType'] === EButtonActionType.DEALLOCATE;

const isTransferAction = (context: Record<string, unknown>): boolean =>
  context['actionType'] === EButtonActionType.TRANSFER;

const WORKFORCE_ALLOCATION_ACTION_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IWorkforceAllocationActionFormDto> =
  {
    projectName: {
      fieldType: EDataType.SELECT,
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        },
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean =>
            isAllocateAction(context) || isTransferAction(context),
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
    allocateDate: {
      fieldType: EDataType.DATE,
      id: 'allocateDate',
      fieldName: 'allocateDate',
      label: 'Allocate Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean =>
            isAllocateAction(context) || isTransferAction(context),
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
    releaseDate: {
      fieldType: EDataType.DATE,
      id: 'releaseDate',
      fieldName: 'releaseDate',
      label: 'Release Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean =>
            isDeallocateAction(context) || isTransferAction(context),
          validators: [Validators.required],
          resetOnFalse: true,
        },
      ],
    },
  };

export const WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG: IFormConfig<IWorkforceAllocationActionFormDto> =
  {
    fields: WORKFORCE_ALLOCATION_ACTION_FORM_FIELDS_CONFIG,
  };
