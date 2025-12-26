import {
  BANK_NAME_DATA,
  BRANCH_DATA,
  DEGREE_DATA,
  DESIGNATION_DATA,
  EMPLOYEE_BLOOD_GROUP_DATA,
  EMPLOYEE_GENDER_DATA,
  EMPLOYEE_STATUS_DATA,
  EMPLOYMENT_TYPE_DATA,
  INDIA_CITY_DATA,
  INDIA_STATE_DATA,
  ROLE_NAME_DATA,
} from '@shared/config/static-data.config';
import { onlyDateStringField, uuidField } from '@shared/schemas';
import z from 'zod';

export const EmployeeBaseSchema = z.object({
  id: uuidField,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  contactNumber: z.string(),
  profilePicture: z.string(),
  status: z.enum(EMPLOYEE_STATUS_DATA.map(item => item.value)),
  employeeId: z.string(),
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
  pincode: z.string(),
  dateOfJoining: onlyDateStringField,
  previousExperience: z.string(),
  employeeType: z.enum(EMPLOYMENT_TYPE_DATA.map(item => item.value)),
  designation: z.enum(DESIGNATION_DATA.map(item => item.value)),
  degree: z.enum(DEGREE_DATA.map(item => item.value)).nullable(),
  branch: z.enum(BRANCH_DATA.map(item => item.value)).nullable(),
  passoutYear: z.number().nullable(),
  bankHolderName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  bankName: z.enum(BANK_NAME_DATA.map(item => item.value)).nullable(),
  ifscCode: z.string().nullable(),
  esicNumber: z.string().nullable(),
  aadharNumber: z.string(),
  panNumber: z.string().nullable(),
  dlNumber: z.string().nullable(),
  uanNumber: z.string().nullable(),
  passportNumber: z.string().nullable(),
  roles: z.array(
    z.object({
      name: z.enum(ROLE_NAME_DATA.map(item => item.value)),
    })
  ),
});
