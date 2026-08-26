import { EAttendanceStatus } from '../types/attendance.enum';
import {
  IAttendanceAssignmentFormValues,
  IAttendanceAssignmentPayload,
  IAttendanceAssignmentSubmitPayload,
} from '../types/attendance.interface';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';

type AssignmentVehicle = NonNullable<
  IAttendanceAssignmentSubmitPayload['vehicle']
>;

export function isAttendanceAssignmentApplicable(
  status: string | null | undefined
): boolean {
  return status?.trim() === EAttendanceStatus.PRESENT;
}

export const NULL_ASSIGNMENT_FORM_VALUES = {
  company: null,
  contractor: null,
  vehicle: null,
  assignedEngineer: null,
} as const;

export function isBlankAssignmentId(
  value: string | null | undefined
): value is null | undefined | '' {
  return value == null || value === '';
}

export function getAssignmentSource(
  payload: unknown
): IAttendanceAssignmentPayload | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as IAttendanceAssignmentPayload;
  const snapshot = record.assignmentSnapshot;

  return {
    company: record.company ?? snapshot?.company ?? null,
    contractors: record.contractors ?? snapshot?.contractors ?? null,
    vehicle: record.vehicle ?? snapshot?.vehicle ?? null,
    assignedEngineer:
      record.assignedEngineer ?? snapshot?.assignedEngineer ?? null,
    user: record.user ?? snapshot?.user ?? null,
  };
}

export function getAssignmentFormValues(
  payload: unknown,
  options?: { includeSiteFields?: boolean }
): IAttendanceAssignmentFormValues {
  const source = getAssignmentSource(payload);
  const includeSiteFields = options?.includeSiteFields !== false;

  return {
    company: includeSiteFields ? (source?.company?.id ?? null) : null,
    contractor: includeSiteFields
      ? (source?.contractors?.[0]?.id ?? null)
      : null,
    vehicle: includeSiteFields ? (source?.vehicle?.id ?? null) : null,
    assignedEngineer: source?.assignedEngineer?.id ?? null,
  };
}

export function getAssignmentSiteFormValues(
  payload: unknown
): Pick<IAttendanceAssignmentFormValues, 'company' | 'contractor' | 'vehicle'> {
  const { company, contractor, vehicle } = getAssignmentFormValues(payload);
  return { company, contractor, vehicle };
}

export function getDropdownRecord<T extends object>(
  list: { value?: string; data?: unknown }[],
  id: string | null
): T | null {
  if (!id) {
    return null;
  }

  const mapped = getMappedValueFromArrayOfObjects(list, id, 'value', 'data');
  return mapped && typeof mapped === 'object' ? (mapped as T) : null;
}

export function toDisplayName(
  payloadName: string | null | undefined,
  payloadId: string | null | undefined,
  selectedId: string | null,
  listName: string | null | undefined
): string {
  const usePayload = !selectedId || !payloadId || payloadId === selectedId;
  return (usePayload ? payloadName?.trim() : '') || listName?.trim() || '-';
}

export function toPersonName(
  person:
    | { firstName?: string | null; lastName?: string | null }
    | null
    | undefined
): string {
  return `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
}

export function buildAssignmentSubmitPayload(params: {
  companyId: string | null;
  contractorId: string | null;
  vehicleId: string | null;
  assignedEngineerId: string | null;
  companyList: { value?: string; data?: unknown }[];
  contractorList: { value?: string; data?: unknown }[];
  vehicleList: { value?: string; data?: unknown }[];
  employeeList: { value?: string; data?: unknown }[];
  source: IAttendanceAssignmentPayload | null;
}): IAttendanceAssignmentSubmitPayload {
  const companyFromList = getDropdownRecord<ICompanyGetBaseResponseDto>(
    params.companyList,
    params.companyId
  );
  const contractorFromList = getDropdownRecord<IContractorGetBaseResponseDto>(
    params.contractorList,
    params.contractorId
  );
  const vehicleFromList = getDropdownRecord<AssignmentVehicle>(
    params.vehicleList,
    params.vehicleId
  );
  const engineerFromList = getDropdownRecord<IEmployeeGetBaseResponseDto>(
    params.employeeList,
    params.assignedEngineerId
  );

  const sourceCompany = params.source?.company;
  const sourceContractor = params.source?.contractors?.[0];
  const sourceVehicle = params.source?.vehicle;
  const sourceEngineer = params.source?.assignedEngineer ?? params.source?.user;

  return {
    company:
      companyFromList ??
      (sourceCompany?.id === params.companyId
        ? (sourceCompany as ICompanyGetBaseResponseDto)
        : null),
    contractor:
      contractorFromList ??
      (sourceContractor?.id === params.contractorId
        ? (sourceContractor as IContractorGetBaseResponseDto)
        : null),
    vehicle:
      vehicleFromList ??
      (sourceVehicle?.id === params.vehicleId
        ? (sourceVehicle as AssignmentVehicle)
        : null),
    assignedEngineer: engineerFromList
      ? {
          id: engineerFromList.id,
          firstName: engineerFromList.firstName,
          lastName: engineerFromList.lastName,
          employeeId: engineerFromList.employeeId,
        }
      : sourceEngineer?.id === params.assignedEngineerId && sourceEngineer.id
        ? {
            id: sourceEngineer.id,
            firstName: sourceEngineer.firstName ?? '',
            lastName: sourceEngineer.lastName ?? '',
            employeeId: sourceEngineer.employeeId ?? '',
          }
        : null,
  };
}
