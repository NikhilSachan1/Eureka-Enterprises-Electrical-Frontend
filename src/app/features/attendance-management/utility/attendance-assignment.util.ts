import { EAttendanceStatus } from '../types/attendance.enum';
import {
  IAttendanceAssignmentFormValues,
  IAttendanceAssignmentPayload,
  IAttendanceAssignmentPerson,
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
  assignedDriver: null,
} as const;

export function isBlankAssignmentId(
  value: string | null | undefined
): value is null | undefined | '' {
  return value == null || value === '';
}

export function getAssignedDrivers(
  payload: unknown
): IAttendanceAssignmentPerson[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as IAttendanceAssignmentPayload & {
    assignedDrivers?: unknown;
  };
  const raw = record.assignedDrivers ??
    record.assignmentSnapshot?.assignedDrivers ??
    null;

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((item: unknown) => {
    if (typeof item === 'string' && item.trim()) {
      return [{ id: item }];
    }

    if (item && typeof item === 'object' && 'id' in item) {
      const person = item as IAttendanceAssignmentPerson;
      return person.id ? [person] : [];
    }

    return [];
  });
}

export function getAssignedDriverId(payload: unknown): string | null {
  const first = getAssignedDrivers(payload)[0];
  return typeof first?.id === 'string' && first.id.trim() ? first.id : null;
}

export function getAssignedDriverDisplayName(
  payload: unknown,
  employeeList: { value?: string; data?: unknown }[] = []
): string | null {
  const driver = getAssignedDrivers(payload)[0];
  const listDriver = getDropdownRecord<IEmployeeGetBaseResponseDto>(
    employeeList,
    driver?.id ?? null
  );
  return toPersonName(driver) || toPersonName(listDriver) || null;
}

export function getAssignedEmployee(
  payload: unknown
): IAttendanceAssignmentPerson | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as IAttendanceAssignmentPayload;
  const employee =
    record.assignedEngineer ??
    record.assignmentSnapshot?.assignedEngineer ??
    null;

  return employee?.id ? employee : null;
}

export function getAssignedEmployeeDisplayName(
  payload: unknown
): string | null {
  return toPersonName(getAssignedEmployee(payload)) || null;
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
    assignedDrivers: getAssignedDrivers(payload),
    assignedEngineer: getAssignedEmployee(payload),
    user: record.user ?? snapshot?.user ?? null,
  };
}

export function getAssignmentFormValues(
  payload: unknown,
  options?: { includeSiteFields?: boolean; includeAssignedDriver?: boolean }
): IAttendanceAssignmentFormValues {
  const source = getAssignmentSource(payload);
  const includeSiteFields = options?.includeSiteFields !== false;
  const includeAssignedDriver = options?.includeAssignedDriver === true;

  return {
    company: includeSiteFields ? (source?.company?.id ?? null) : null,
    contractor: includeSiteFields
      ? (source?.contractors?.[0]?.id ?? null)
      : null,
    vehicle: includeSiteFields ? (source?.vehicle?.id ?? null) : null,
    assignedDriver: includeAssignedDriver ? getAssignedDriverId(payload) : null,
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

export function formatAssignmentAddress(
  location:
    | {
        fullAddress?: string | null;
        city?: string | null;
        state?: string | null;
      }
    | null
    | undefined
): string | null {
  const fullAddress = location?.fullAddress?.trim();
  if (fullAddress) {
    return fullAddress;
  }

  const city = location?.city?.trim();
  const state = location?.state?.trim();
  if (city && state && city.toLowerCase() !== state.toLowerCase()) {
    return `${city}, ${state}`;
  }

  return city || state || null;
}

export function buildAssignmentSubmitPayload(params: {
  companyId: string | null;
  contractorId: string | null;
  vehicleId: string | null;
  assignedDriverId: string | null;
  companyList: { value?: string; data?: unknown }[];
  contractorList: { value?: string; data?: unknown }[];
  vehicleList: { value?: string; data?: unknown }[];
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

  const sourceCompany = params.source?.company;
  const sourceContractor = params.source?.contractors?.[0];
  const sourceVehicle = params.source?.vehicle;

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
    assignedDriver: params.assignedDriverId,
  };
}
