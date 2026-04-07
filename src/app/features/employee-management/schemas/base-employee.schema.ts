import { SalaryBaseSchema } from '@features/payroll-management/schemas';
import {
  dateField,
  firstFileField,
  onlyDateStringField,
  uuidField,
} from '@shared/schemas';
import z from 'zod';

export const EmployeeBaseSchema = z.looseObject({
  id: uuidField,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  contactNumber: z.string(),
  profilePicture: z.string(),
  status: z.string().min(1),
  employeeId: z.string(),
  fatherName: z.string(),
  emergencyContactNumber: z.string(),
  gender: z.string().min(1),
  dateOfBirth: onlyDateStringField,
  bloodGroup: z.string().min(1),
  houseNumber: z.string(),
  streetName: z.string(),
  landmark: z.string(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string(),
  dateOfJoining: onlyDateStringField,
  previousExperience: z.string(),
  employeeType: z.string().min(1),
  designation: z.string().min(1),
  degree: z.string().min(1).nullable(),
  branch: z.string().min(1).nullable(),
  passoutYear: z.number().nullable(),
  bankHolderName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  bankName: z.string().min(1).nullable(),
  ifscCode: z.string().nullable(),
  esicNumber: z.string().nullable(),
  aadharNumber: z.string(),
  panNumber: z.string().nullable(),
  dlNumber: z.string().nullable(),
  uanNumber: z.string().nullable(),
  passportNumber: z.string().nullable(),
  roles: z.array(
    z.object({
      name: z.string().min(1),
    })
  ),
});

export const EmployeeUpsertShapeSchema = EmployeeBaseSchema.omit({
  id: true,
  status: true,
  pincode: true,
  passoutYear: true,
  bankHolderName: true,
  employeeType: true,
  dlNumber: true,
  roles: true,
})
  .extend({
    profilePicture: firstFileField,
    esicDocument: firstFileField.nullable(),
    aadharDocument: firstFileField,
    panDocument: firstFileField.nullable(),
    drivingLicenseDocument: firstFileField.nullable(),
    uanDocument: firstFileField.nullable(),
    passportDocument: firstFileField.nullable(),
    degreeDocument: firstFileField.nullable(),
    offerLetterDoc: firstFileField.optional(),
    experienceLetterDoc: firstFileField.optional(),
    passingYear: z.string().nullable(),
    pinCode: z.string(),
    accountHolderName: z.string().nullable(),
    employmentType: z.string().min(1),
    drivingLicenseNumber: z.string().nullable(),
    dateOfJoining: dateField,
    dateOfBirth: dateField,
    ...SalaryBaseSchema.shape,
  })
  .strict();
