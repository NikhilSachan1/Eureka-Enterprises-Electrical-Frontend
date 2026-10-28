import type { IAssetGetResponseDto } from '@features/asset-management/types/asset.dto';
import type { ICompanyBankAccountGetResponseDto } from '@features/company-bank-account-management/types/company-bank-account.dto';
import type { IEmployeeGetResponseDto } from '@features/employee-management/types/employee.dto';
import type { ICompanyGetResponseDto } from '@features/site-management/company-management/types/company.dto';
import type { IContractorGetResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import type { IProjectGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import { mapProjectSiteTypeDisplays } from '@features/site-management/project-management/utility/project-site-type.util';
import type { IVendorGetResponseDto } from '@features/site-management/vendor-management/types/vendor.dto';
import type { IPetroCardGetResponseDto } from '@features/transport-management/petro-card-management/types/petro-card.dto';
import type { IVehicleGetResponseDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import { IOptionDropdown } from '@shared/types';
import { toTitleCase } from '@shared/utility';

/** Initials for rich dropdown rows (company / contractor / asset). */
export function initialsForDropdownLabel(
  rawLabel: string
): string | undefined {
  const t = rawLabel.trim();
  if (!t) {
    return undefined;
  }
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

/** Rich dropdown subtitle: GST (if any) + city/state for contractor & vendor lists. */
export function buildContractorVendorDropdownSubtitle(entity: {
  code?: string | null;
  gstNumber?: string | null;
  city?: string | null;
  state?: string | null;
  email?: string | null;
  id: string;
}): string {
  const location = [entity.city?.trim(), entity.state?.trim()]
    .filter(Boolean)
    .join(', ');
  const gst = entity.gstNumber?.trim();
  const code = entity.code?.trim();
  const parts: string[] = [];
  if (code) {
    parts.push(code);
  }
  if (gst) {
    parts.push(`GST ${gst}`);
  }
  if (location) {
    parts.push(location);
  }
  if (parts.length > 0) {
    return parts.join(' | ');
  }
  const email = entity.email?.trim();
  if (email) {
    return email;
  }
  return `ID ${entity.id.slice(0, 8)}`;
}

export function toEmployeeDropdownOption(
  employee: IEmployeeGetResponseDto['records'][number]
): IOptionDropdown {
  const first = employee.firstName?.trim() ?? '';
  const last = employee.lastName?.trim() ?? '';
  const employeeStatus = employee.status?.trim() ?? '';
  const formattedEmployeeStatus = employeeStatus
    ? toTitleCase(employeeStatus)
    : '';
  const employeeCode = employee.employeeId?.trim() ?? '';
  const subtitleParts = [employeeCode, formattedEmployeeStatus].filter(
    Boolean
  );
  const initialChar =
    first.charAt(0) ||
    last.charAt(0) ||
    (employee.employeeId?.trim()?.charAt(0) ?? '');

  return {
    label: toTitleCase(`${first} ${last}`.trim()),
    subtitle:
      subtitleParts.length > 0 ? subtitleParts.join(' • ') : undefined,
    initial: initialChar ? initialChar.toUpperCase() : undefined,
    value: employee.id,
    disabled: employeeStatus.toLowerCase() === 'archived',
    data: employee,
  };
}

export function toAssetDropdownOption(
  asset: IAssetGetResponseDto['records'][number]
): IOptionDropdown {
  const rawName = asset.name?.trim() ?? '';
  const aid = asset.assetId?.trim();
  return {
    label: toTitleCase(rawName),
    subtitle: aid || undefined,
    initial: initialsForDropdownLabel(rawName),
    value: asset.id,
    data: asset,
  };
}

export function toVehicleDropdownOption(
  vehicle: IVehicleGetResponseDto['records'][number]
): IOptionDropdown {
  const reg = vehicle.registrationNo?.trim() ?? '';
  const brandModel = [vehicle.brand, vehicle.model]
    .filter(Boolean)
    .join(' ')
    .trim();
  const initialMatch = reg.match(/[A-Za-z0-9]/);
  return {
    label: reg,
    subtitle: brandModel ? toTitleCase(brandModel) : undefined,
    initial: initialMatch ? initialMatch[0].toUpperCase() : undefined,
    value: vehicle.id,
    data: vehicle,
  };
}

export function toPetroCardDropdownOption(
  petroCard: IPetroCardGetResponseDto['records'][number]
): IOptionDropdown {
  return {
    label: toTitleCase(
      `${petroCard.cardName} (${petroCard.cardNumber})`.trim()
    ),
    value: petroCard.id,
  };
}

export function toCompanyBankAccountDropdownOption(
  account: ICompanyBankAccountGetResponseDto['records'][number]
): IOptionDropdown {
  const bankName = account.bankName?.trim() ?? '';
  const accountNumber = account.accountNumber?.trim() ?? '';
  const accountHolderName = account.accountHolderName?.trim() ?? '';
  return {
    label: toTitleCase(`${bankName} (${accountNumber})`.trim()),
    subtitle: accountHolderName || undefined,
    value: account.id,
    data: account,
  };
}

export function toCompanyDropdownOption(
  company: ICompanyGetResponseDto['records'][number]
): IOptionDropdown {
  const rawName = company.name?.trim() ?? '';
  const subtitle =
    [company.city, company.state].filter(Boolean).join(', ') ||
    `ID ${company.id.slice(0, 8)}`;
  return {
    label: toTitleCase(rawName),
    subtitle,
    initial: initialsForDropdownLabel(rawName),
    value: company.id,
    data: company,
  };
}

export function toContractorDropdownOption(
  contractor: IContractorGetResponseDto['records'][number]
): IOptionDropdown {
  const rawName = contractor.name?.trim() ?? '';
  return {
    label: toTitleCase(rawName),
    subtitle: buildContractorVendorDropdownSubtitle({
      gstNumber: contractor.gstNumber,
      city: contractor.city,
      state: contractor.state,
      email: contractor.email,
      id: contractor.id,
    }),
    initial: initialsForDropdownLabel(rawName),
    value: contractor.id,
    data: contractor,
  };
}

export function toVendorDropdownOption(
  vendor: IVendorGetResponseDto['records'][number]
): IOptionDropdown {
  const rawName = vendor.name?.trim() ?? '';
  return {
    label: toTitleCase(rawName),
    subtitle: buildContractorVendorDropdownSubtitle({
      code: vendor.vendorCode,
      gstNumber: vendor.gstNumber,
      city: vendor.city,
      state: vendor.state,
      email: vendor.email,
      id: vendor.id,
    }),
    initial: initialsForDropdownLabel(rawName),
    value: vendor.id,
    data: vendor,
  };
}

export function toProjectDropdownOption(
  project: IProjectGetResponseDto['records'][number],
  projectSiteTypes: IOptionDropdown[]
): IOptionDropdown {
  const rawName = project.name?.trim() ?? '';
  const siteTypeLabels = mapProjectSiteTypeDisplays(
    project.siteTypes,
    projectSiteTypes
  )
    .map(item => item.label)
    .join(' · ');
  const location =
    [project.city, project.state].filter(Boolean).join(', ') || undefined;
  const label = toTitleCase(rawName);
  const subtitle =
    [siteTypeLabels, location].filter(Boolean).join(' · ') || undefined;
  return {
    label,
    subtitle,
    initial: initialsForDropdownLabel(rawName),
    value: project.id,
    data: project,
  };
}

export function sortDropdownByLabel(
  a: IOptionDropdown,
  b: IOptionDropdown
): number {
  return a.label.localeCompare(b.label);
}
