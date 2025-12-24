import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';
import { AuditSchema, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

const { id } = EmployeeBaseSchema.shape;

export const EmployeeDetailGetRequestSchema = z
  .object({
    id,
  })
  .strict();

export const EmployeeDetailGetDocumentsBaseSchema = z
  .object({
    id: uuidField,
    fileKey: z.string(),
    fileName: z.string().nullable().optional(),
  })
  .strict();

export const EmployeeDetailGetDocumentsSchema = z
  .object({
    AADHAR: z.array(EmployeeDetailGetDocumentsBaseSchema),
    DRIVING_LICENSE: z.array(EmployeeDetailGetDocumentsBaseSchema),
    ESIC: z.array(EmployeeDetailGetDocumentsBaseSchema),
    PAN: z.array(EmployeeDetailGetDocumentsBaseSchema),
    PASSPORT: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    UAN: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    DEGREE: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
  })
  .transform(data => {
    const aadhar = data.AADHAR.map(doc => doc.fileKey);
    const drivingLicense = data.DRIVING_LICENSE.map(doc => doc.fileKey);
    const esic = data.ESIC.map(doc => doc.fileKey);
    const pan = data.PAN.map(doc => doc.fileKey);
    const passport = data.PASSPORT?.map(doc => doc.fileKey) ?? [];
    const uan = data.UAN?.map(doc => doc.fileKey) ?? [];
    const degree = data.DEGREE?.map(doc => doc.fileKey) ?? [];

    // Collect all document keys into a single array
    const allDocumentKeys = [
      ...aadhar,
      ...drivingLicense,
      ...esic,
      ...pan,
      ...passport,
      ...uan,
      ...degree,
    ];

    return {
      AADHAR: aadhar,
      DRIVING_LICENSE: drivingLicense,
      ESIC: esic,
      PAN: pan,
      PASSPORT: passport,
      UAN: uan,
      DEGREE: degree,
      allDocumentKeys,
    };
  });

export const EmployeeDetailGetResponseSchema = EmployeeBaseSchema.extend({
  ...AuditSchema.shape,
  passwordUpdatedAt: z.iso.datetime().nullable(),
  documents: EmployeeDetailGetDocumentsSchema,
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
})
  .strict()
  .transform(({ roles: employeeRoles, ...rest }) => {
    return {
      ...rest,
      roles: employeeRoles.map(role => role.name).join(', '),
    };
  });
