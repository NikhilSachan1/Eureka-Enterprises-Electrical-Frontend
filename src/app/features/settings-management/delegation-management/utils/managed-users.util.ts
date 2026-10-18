import { IUserDelegationManagedUserDto } from '@features/settings-management/delegation-management/types/user-delegation.dto';
import {
  IDataTableHeaderConfig,
  IInputFieldsConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';

type ManagedUserDropdownField = {
  selectConfig?: IInputFieldsConfig['selectConfig'];
  multiSelectConfig?: IInputFieldsConfig['multiSelectConfig'];
};

/** True when the saved scope includes someone other than the caller. */
export function managesOtherUsers(
  users: IUserDelegationManagedUserDto[]
): boolean {
  return users.some(user => !user.isSelf);
}

export function managedUserIds(
  users: IUserDelegationManagedUserDto[],
  excludeSelf = false
): string[] {
  return users
    .filter(user => !excludeSelf || !user.isSelf)
    .map(user => user.id);
}

/** Keeps the existing employee dropdown and limits it to these user ids. */
export function withManagedUserInclude<T extends ManagedUserDropdownField>(
  field: T,
  userIds: string[]
): T {
  if (field.multiSelectConfig) {
    return {
      ...field,
      multiSelectConfig: {
        ...field.multiSelectConfig,
        filterOptions: {
          ...field.multiSelectConfig.filterOptions,
          include: userIds,
        },
      },
    };
  }

  if (field.selectConfig) {
    return {
      ...field,
      selectConfig: {
        ...field.selectConfig,
        filterOptions: {
          ...field.selectConfig.filterOptions,
          include: userIds,
        },
      },
    };
  }

  return field;
}

/**
 * When the caller manages others, the employee filter stays the normal dropdown
 * and is limited to the saved managed users. The field permission is dropped so
 * an employee or driver manager can see it.
 */
export function applyManagedUsersToSearchFilter<
  T extends ITableSearchFilterFormConfig,
>(
  config: T,
  users: IUserDelegationManagedUserDto[],
  fieldName = 'employeeName'
): T {
  if (!managesOtherUsers(users)) {
    return config;
  }

  const fields = config.fields as Record<
    string,
    (ManagedUserDropdownField & { permission?: string[] }) | undefined
  >;
  const field = fields[fieldName];
  if (!field) {
    return config;
  }

  const { permission: _permission, ...employeeField } = field;

  return {
    ...config,
    fields: {
      ...config.fields,
      [fieldName]: withManagedUserInclude(
        employeeField,
        managedUserIds(users)
      ),
    },
  };
}

/** Shows the employee name column when the caller manages others. */
export function revealEmployeeColumnForManagedUsers(
  headers: IDataTableHeaderConfig[],
  users: IUserDelegationManagedUserDto[],
  fieldName = 'employeeName'
): IDataTableHeaderConfig[] {
  if (!managesOtherUsers(users)) {
    return headers;
  }

  return headers.map(header => {
    if (header.field !== fieldName) {
      return header;
    }
    const { permission: _permission, ...employeeName } = header;
    return employeeName;
  });
}
