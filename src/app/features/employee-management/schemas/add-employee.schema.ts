import { z } from 'zod';
import { EmployeeBaseSchema } from './base-employee.schema';
import {
  BANK_NAME_DATA,
  BRANCH_DATA,
  DEGREE_DATA,
  DESIGNATION_DATA,
  EMPLOYEE_BLOOD_GROUP_DATA,
  EMPLOYEE_GENDER_DATA,
  EMPLOYMENT_TYPE_DATA,
  INDIA_CITY_DATA,
  INDIA_STATE_DATA,
} from '@shared/config/static-data.config';
import { fileField, onlyDateStringField } from '@shared/schemas';

const { firstName, lastName, email, contactNumber, role } =
  EmployeeBaseSchema.shape;

export const EmployeeAddRequestSchema = EmployeeBaseSchema.omit({
  id: true,
  status: true,
  employeeId: true,
}).extend({
  firstName,
  lastName,
  email,
  contactNumber,
  role: role.shape.name,
  fatherName: z.string(),
  emergencyContactNumber: z.string(),
  gender: z.enum(EMPLOYEE_GENDER_DATA.map(item => item.value)),
  dateOfBirth: onlyDateStringField,
  bloodGroup: z.enum(EMPLOYEE_BLOOD_GROUP_DATA.map(item => item.value)),
  houseNumber: z.string(),
  streetName: z.string(),
  landmark: z.string(),
  city: z.enum(
    Object.values(INDIA_CITY_DATA)
      .flat()
      .map(item => item.value)
  ),
  state: z.enum(INDIA_STATE_DATA.map(item => item.value)),
  pinCode: z.string(),
  dateOfJoining: onlyDateStringField,
  previousExperience: z.number().int().nonnegative(),
  employeeType: z.enum(EMPLOYMENT_TYPE_DATA.map(item => item.value)),
  designation: z.enum(DESIGNATION_DATA.map(item => item.value)),
  degree: z.enum(DEGREE_DATA.map(item => item.value)),
  branch: z.enum(BRANCH_DATA.map(item => item.value)),
  passoutYear: z.number().int().nonnegative(),
  bankHolderName: z.string(),
  accountNumber: z.string(),
  bankName: z.enum(BANK_NAME_DATA.map(item => item.value)),
  ifscCode: z.string(),
  esicNumber: z.string(),
  aadharNumber: z.string(),
  panNumber: z.string(),
  dlNumber: z.string(),
  profilePicture: fileField,
  esicDoc: fileField,
  aadharDoc: fileField,
  panDoc: fileField,
  dlDoc: fileField,
});

export const EmployeeAddResponseSchema = z.object({
  message: z.string(),
});
