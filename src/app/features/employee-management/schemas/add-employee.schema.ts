import { z } from 'zod';
import { EmployeeUpsertShapeSchema } from './base-employee.schema';
import { uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import { EUserRole } from '@shared/constants';

const { employeeId } = EmployeeUpsertShapeSchema.shape;

export const EmployeeAddRequestSchema =
  EmployeeUpsertShapeSchema.strict().transform(
    ({
      dateOfJoining,
      dateOfBirth,
      basicSalary,
      hra,
      tds,
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
      salary: {
        basic: basicSalary,
        hra,
        tds,
        esic: employerEsicContribution,
        employeePf: employeePfContribution,
        foodAllowance,
      },
      roles: designation === EUserRole.DRIVER ? ['DRIVER'] : ['ADMIN'],
    })
  );

export const EmployeeAddResponseSchema = z
  .object({
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
  })
  .strict();
