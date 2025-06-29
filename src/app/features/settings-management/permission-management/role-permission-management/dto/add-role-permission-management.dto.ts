import { z } from "zod";
import { CommonRoleFields } from "./common-role-permission-management.dto";
import { RoleListBaseResponseSchema } from "./role-permission-management-list.dto";
import { toLowerCase } from "../../../../../shared/utility";

export const AddRoleManagementDto = z.object({
  name: CommonRoleFields.name.transform((val) => toLowerCase(val)),
  description: CommonRoleFields.description.transform((val) => toLowerCase(val)),
}).strict();

export const AddRoleManagementResponseSchema = RoleListBaseResponseSchema;

