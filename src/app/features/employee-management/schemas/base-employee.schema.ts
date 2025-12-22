import {
  DESIGNATION_DATA,
  EMPLOYEE_STATUS_DATA,
  EMPLOYMENT_TYPE_DATA,
  ROLE_NAME_DATA,
} from '@shared/config/static-data.config';
import { uuidField } from '@shared/schemas';
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
  dateOfJoining: z.string(),
  employeeType: z.enum(EMPLOYMENT_TYPE_DATA.map(item => item.value)),
  designation: z.enum(DESIGNATION_DATA.map(item => item.value)),
  role: z.object({
    name: z.enum(ROLE_NAME_DATA.map(item => item.value)),
  }),
});
