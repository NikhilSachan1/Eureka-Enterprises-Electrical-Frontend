import { transformDateFormat } from '@shared/utility';
import { EmployeeUpsertShapeSchema } from './base-employee.schema';
import { EmployeeDetailGetResponseSchema } from './get-employee-detail.schema';
import z from 'zod';

export const EmployeeEditRequestSchema = EmployeeUpsertShapeSchema.omit({
  basicSalary: true,
  hra: true,
  tds: true,
  employerEsicContribution: true,
  employeePfContribution: true,
  foodAllowance: true,
})
  .extend({
    employeeId: z.string().optional(),
  })
  .strict()
  .transform(
    ({
      dateOfJoining,
      dateOfBirth,
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
    })
  );

export const EmployeeEditResponseSchema = EmployeeDetailGetResponseSchema;
