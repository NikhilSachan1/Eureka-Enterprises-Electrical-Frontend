import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';
import {
  AuditSchema,
  isoDateTimeField,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

const { id } = EmployeeBaseSchema.shape;

export const EmployeeDetailGetRequestSchema = z
  .object({
    id,
  })
  .strict();

export const EmployeeDetailGetDocumentsBaseSchema = z.looseObject({
  id: uuidField,
  fileKey: z.string(),
  fileName: z.string().nullable().optional(),
});

export const EmployeeDetailGetDocumentsSchema = z
  .looseObject({
    AADHAR: z.array(EmployeeDetailGetDocumentsBaseSchema),
    DRIVING_LICENSE: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    ESIC: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    PAN: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    PASSPORT: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    UAN: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    EDUCATION_CERTIFICATE: z
      .array(EmployeeDetailGetDocumentsBaseSchema)
      .optional(),
    OFFER_LETTER: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
    EXPERIENCE_LETTER: z.array(EmployeeDetailGetDocumentsBaseSchema).optional(),
  })
  .transform(data => {
    const aadhar = data.AADHAR.map(doc => doc.fileKey);
    const drivingLicense = data.DRIVING_LICENSE?.map(doc => doc.fileKey) ?? [];
    const esic = data.ESIC?.map(doc => doc.fileKey) ?? [];
    const pan = data.PAN?.map(doc => doc.fileKey) ?? [];
    const passport = data.PASSPORT?.map(doc => doc.fileKey) ?? [];
    const uan = data.UAN?.map(doc => doc.fileKey) ?? [];
    const degree = data.EDUCATION_CERTIFICATE?.map(doc => doc.fileKey) ?? [];
    const offerLetter = data.OFFER_LETTER?.map(doc => doc.fileKey) ?? [];
    const experienceLetter =
      data.EXPERIENCE_LETTER?.map(doc => doc.fileKey) ?? [];

    // Collect all document keys into a single array
    const allDocumentKeys = [
      ...aadhar,
      ...drivingLicense,
      ...esic,
      ...pan,
      ...passport,
      ...uan,
      ...degree,
      ...offerLetter,
      ...experienceLetter,
    ];

    return {
      AADHAR: aadhar,
      DRIVING_LICENSE: drivingLicense,
      ESIC: esic,
      PAN: pan,
      PASSPORT: passport,
      UAN: uan,
      DEGREE: degree,
      OFFER_LETTER: offerLetter,
      EXPERIENCE_LETTER: experienceLetter,
      allDocumentKeys,
    };
  });

export const EmployeeDetailGetResponseSchema = EmployeeBaseSchema.extend({
  ...AuditSchema.shape,
  passwordUpdatedAt: isoDateTimeField.nullable(),
  documents: EmployeeDetailGetDocumentsSchema,
  createdByUser: UserSchema,
  updatedByUser: makeFieldsNullable(UserSchema).nullable(),
  whatsappOptIn: z.boolean(),
  whatsappNumber: z.string().nullable(),
  whatsappOptInAt: isoDateTimeField.nullable(),
  exitDate: isoDateTimeField.nullable(),
  exitReason: z.string().nullable(),
  exitRemarks: z.string().nullable(),
  noticePeriodWaived: z.boolean(),
  lastWorkingDate: isoDateTimeField.nullable(),
  timezone: z.string().nullable(),
})
  .loose()
  .transform(({ roles: employeeRoles, ...rest }) => {
    return {
      ...rest,
      roles: employeeRoles.map(role => role.name).join(', '),
    };
  });
