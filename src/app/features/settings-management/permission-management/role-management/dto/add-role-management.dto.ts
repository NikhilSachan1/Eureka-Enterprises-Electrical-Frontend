import { z } from "zod";
import { CommonRoleFields } from "./common-role-management.dto";
import { RoleListBaseResponseSchema } from "./role-list-management.dto";
import { replaceTextWithSeparator, toLowerCase } from "../../../../../shared/utility";

export const AddRoleManagementDto = z.object({
  name: CommonRoleFields.name.transform((val) => replaceTextWithSeparator(toLowerCase(val), ' ', '_')),
  description: CommonRoleFields.description.transform((val) => toLowerCase(val)),
  label: CommonRoleFields.label.transform((val) => toLowerCase(val)),
}).strict();

export const AddRoleManagementResponseSchema = RoleListBaseResponseSchema;

