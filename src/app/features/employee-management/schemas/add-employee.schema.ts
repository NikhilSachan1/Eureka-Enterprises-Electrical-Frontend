import { z } from 'zod';
import { EmployeeUpsertShapeSchema } from './base-employee.schema';
import { uuidField } from '@shared/schemas';
import { toLowerCase, transformDateFormat } from '@shared/utility';
import { EUserRole } from '@shared/constants';

const { employeeId } = EmployeeUpsertShapeSchema.shape;

const SITE_SECTION_INCHARGE_DESIGNATION = 'site_section_incharge';

const getRolesForDesignation = (designation: string): EUserRole[] => {
  switch (toLowerCase(designation)) {
    case toLowerCase(EUserRole.DRIVER):
      return [EUserRole.DRIVER];
    case toLowerCase(SITE_SECTION_INCHARGE_DESIGNATION):
      return [EUserRole.SITE_INCHARGE];
    case toLowerCase(EUserRole.OPERATION_MANAGER):
      return [EUserRole.OPERATION_MANAGER, EUserRole.EMPLOYEE];
    case toLowerCase(EUserRole.HR):
      return [EUserRole.HR, EUserRole.EMPLOYEE];
    default:
      return [EUserRole.EMPLOYEE];
  }
};

export const EmployeeAddRequestSchema =
  EmployeeUpsertShapeSchema.strict().transform(
    ({
      dateOfJoining,
      dateOfBirth,
      basicSalary,
      hra,
      specialAllowance,
      employerEsicContribution,
      employeePfContribution,
      foodAllowance,
      passingYear,
      pinCode,
      accountHolderName,
      employmentType,
      drivingLicenseNumber,
      esicDocument,
      aadharDocument,
      panDocument,
      drivingLicenseDocument,
      uanDocument,
      passportDocument,
      degreeDocument,
      designation,
      ...rest
    }) => ({
      ...rest,
      dateOfJoining: transformDateFormat(dateOfJoining),
      dateOfBirth: transformDateFormat(dateOfBirth),
      passoutYear: passingYear,
      pincode: pinCode,
      bankHolderName: accountHolderName,
      employeeType: employmentType,
      dlNumber: drivingLicenseNumber,
      esicDoc: esicDocument,
      aadharDoc: aadharDocument,
      panDoc: panDocument,
      dlDoc: drivingLicenseDocument,
      uanDoc: uanDocument,
      passportDoc: passportDocument,
      degreeDoc: degreeDocument,
      designation,
      whatsappNumber: rest.contactNumber,
      whatsappOptIn: true,
      salary: {
        basic: basicSalary,
        hra,
        specialAllowance,
        tds: 0,
        esic: employerEsicContribution,
        employeePf: employeePfContribution,
        employerPf: employeePfContribution,
        foodAllowance,
      },
      roles: getRolesForDesignation(designation),
    })
  );

export const EmployeeAddResponseSchema = z.looseObject({
  id: uuidField,
  employeeId,
  message: z.string(),
  salaryCreated: z.boolean(),
  leavesCredited: z.array(
    z.object({
      category: z.string(),
      allocated: z.number(),
      note: z.string(),
    })
  ),
});
