import { z } from "zod";
import { CommonRoleFields } from "./common-role-permission-management.dto";
import { RoleListBaseResponseSchema } from "./role-permission-management-list.dto";
import { replaceTextWithSeparator, toLowerCase } from "../../../../../shared/utility";

export const AddRoleManagementDto = z.object({
  name: CommonRoleFields.name.transform((val) => replaceTextWithSeparator(toLowerCase(val), ' ', '_')),
  description: CommonRoleFields.description.transform((val) => toLowerCase(val)),
  label: CommonRoleFields.label.transform((val) => toLowerCase(val)),
}).strict();

export const AddRoleManagementResponseSchema = RoleListBaseResponseSchema;

