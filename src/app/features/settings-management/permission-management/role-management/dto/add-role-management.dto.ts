import { z } from "zod";
import { CommonRoleFields } from "@features/settings-management/permission-management/role-management/dto/common-role-management.dto";
import { RoleListBaseResponseSchema } from "@features/settings-management/permission-management/role-management/dto/role-list-management.dto";
import { replaceTextWithSeparator, toLowerCase } from "@shared/utility";

export const AddRoleManagementRequestSchema = z.object({
  name: CommonRoleFields.name.transform((val) => replaceTextWithSeparator(toLowerCase(val), ' ', '_')),
  description: CommonRoleFields.description.transform((val) => toLowerCase(val)),
  label: CommonRoleFields.label.transform((val) => toLowerCase(val)),
}).strict();

export const AddRoleManagementResponseSchema = RoleListBaseResponseSchema;

