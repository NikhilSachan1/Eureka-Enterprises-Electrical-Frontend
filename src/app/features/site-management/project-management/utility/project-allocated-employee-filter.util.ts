import { EDataType, IInputFieldsConfig } from '@shared/types';

import { IProjectOverviewGetResponseDto } from '../types/project.dto';

/** `null` = all employees; `undefined` = overview pending; `string[]` = project scope */
function resolveProjectEmployeeUserIds(
  projectId: string | undefined,
  overview: IProjectOverviewGetResponseDto | null,
  overviewSiteId: string | undefined
): string[] | null | undefined {
  if (!projectId) {
    return null;
  }
  if (!overview || overviewSiteId !== projectId) {
    return undefined;
  }

  const allocated = overview.employees?.allocated ?? [];
  const deallocated = overview.employees?.deallocated ?? [];

  return [...allocated, ...deallocated]
    .map(employee => employee?.userId)
    .filter((userId): userId is string => Boolean(userId));
}

function applyEmployeeFilterByProjectUsers(
  baseConfig: IInputFieldsConfig,
  projectUserIds: string[] | null,
  loading: boolean
): IInputFieldsConfig {
  const isMulti = baseConfig.fieldType === EDataType.MULTI_SELECT;
  const dropdownKey = isMulti ? 'multiSelectConfig' : 'selectConfig';
  const dropdown = baseConfig[dropdownKey];
  if (!dropdown) {
    return baseConfig;
  }

  const scoped = projectUserIds !== null;
  const hasIds = scoped && projectUserIds.length > 0;

  const nextDropdown = {
    ...dropdown,
    loading,
    ...(scoped
      ? hasIds
        ? {
            filterOptions: { include: projectUserIds },
            dynamicDropdown: dropdown.dynamicDropdown,
          }
        : {
            optionsDropdown: [],
            dynamicDropdown: undefined,
            filterOptions: undefined,
            emptyMessage: 'No employee found on this project',
          }
      : {
          filterOptions: undefined,
          dynamicDropdown: dropdown.dynamicDropdown,
        }),
  };

  return { ...baseConfig, [dropdownKey]: nextDropdown } as IInputFieldsConfig;
}

/** Uses workspace overview loaded on project select / search — no extra API call. */
export function buildWorkspaceEmployeeFilterFieldConfig(
  baseConfig: IInputFieldsConfig,
  projectId: string | undefined,
  overview: IProjectOverviewGetResponseDto | null,
  overviewSiteId: string | undefined
): IInputFieldsConfig {
  const userIds = resolveProjectEmployeeUserIds(
    projectId,
    overview,
    overviewSiteId
  );

  if (userIds === null) {
    return applyEmployeeFilterByProjectUsers(baseConfig, null, false);
  }
  if (userIds === undefined) {
    return applyEmployeeFilterByProjectUsers(baseConfig, [], true);
  }
  return applyEmployeeFilterByProjectUsers(baseConfig, userIds, false);
}
