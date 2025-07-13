import { z } from "zod";
import { CommonRoleFields } from "./common-role-management.dto";
import { toLowerCase, toSentenceCase, toTitleCase } from "../../../../../shared/utility";
import { AuditFieldsSchema } from "../../../../../shared/dto/api-response-audit-fields.dto";

export const RoleListBaseResponseSchema = z.object({
    id: z
        .string()
        .uuid(),
    name: CommonRoleFields.name.transform((val) => toLowerCase(val)),
    label: CommonRoleFields.label.transform((val) => toTitleCase(val)),
    description: CommonRoleFields.description.transform((val) => toSentenceCase(val)),
    isEditable: CommonRoleFields.isEditable,
    isDeletable: CommonRoleFields.isDeletable,
    permissionCount: CommonRoleFields.permissionCount,
}).merge(AuditFieldsSchema.pick({
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
})).strict();

export const GetRoleListResponseSchema = z.object({
    records: z.array(RoleListBaseResponseSchema),
    totalRecords: z.number(),
    totalPermissions: z.number()
}).strict();