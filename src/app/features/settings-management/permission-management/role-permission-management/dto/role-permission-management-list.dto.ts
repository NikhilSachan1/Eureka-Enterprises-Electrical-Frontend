import { z } from "zod";
import { CommonRoleFields } from "./common-role-permission-management.dto";
import { toSentenceCase, toTitleCase } from "../../../../../shared/utility";
import { AuditFieldsSchema } from "../../../../../shared/dto/api-response-audit-fields.dto";

export const RoleListBaseResponseSchema = z.object({
    id: z
        .string()
        .uuid(),
    name: CommonRoleFields.name.transform((val) => toTitleCase(val)),
    description: CommonRoleFields.description.transform((val) => toSentenceCase(val)),
}).merge(AuditFieldsSchema.pick({
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
})).strict();

export const GetRoleListResponseSchema = z.object({
    records: z.array(RoleListBaseResponseSchema),
    totalRecords: z.number().min(0)
});