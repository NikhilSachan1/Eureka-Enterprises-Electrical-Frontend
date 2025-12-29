import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';
import { fileField, uuidField } from '@shared/schemas';

const { roles, employeeId } = EmployeeBaseSchema.shape;

export const EmployeeAddRequestSchema = EmployeeBaseSchema.omit({
  id: true,
  status: true,
})
  .extend({
    roles: roles.element.shape.name.array(),
    profilePicture: fileField,
    esicDoc: fileField.nullable().optional(),
    aadharDoc: fileField,
    panDoc: fileField.nullable().optional(),
    dlDoc: fileField.nullable().optional(),
    uanDoc: fileField.nullable().optional(),
    passportDoc: fileField.nullable().optional(),
    degreeDoc: fileField.nullable().optional(),
    offerLetterDoc: fileField.optional(),
    experienceLetterDoc: fileField.optional(),
    passoutYear: z.string().nullable(),
    salary: z
      .object({
        basic: z.number(),
        hra: z.number(),
        tds: z.number(),
        esic: z.number(),
        employeePf: z.number(),
        employerPf: z.number(),
        foodAllowance: z.number(),
      })
      .strict(),
  })
  .strict();

export const EmployeeAddResponseSchema = z
  .object({
    id: uuidField,
    employeeId,
    message: z.string(),
    salaryCreated: z.boolean(),
  })
  .strict();
