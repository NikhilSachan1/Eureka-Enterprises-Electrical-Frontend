import { z } from "zod";
import { AuditFieldsSchema } from "../../../../../shared/dto/api-response-audit-fields.dto";
import { toTitleCase, toSentenceCase, toLowerCase, replaceTextWithSeparator } from "../../../../../shared/utility";
import { CommonSystemPermissionFields } from "./common-system-permission-management.dto";

export const SystemPermissionListBaseResponseSchema = z.object({
    id: z
        .string()
        .uuid(),
    name: CommonSystemPermissionFields.name.transform((val) => toLowerCase(val)),
    module: CommonSystemPermissionFields.module.transform((val) => toTitleCase(val)),
    label: CommonSystemPermissionFields.label.transform((val) => {
        const label = replaceTextWithSeparator(val, '_', ' ');
        return toTitleCase(label);
    }),
    description: CommonSystemPermissionFields.description.transform((val) => toSentenceCase(val)),
    isEditable: CommonSystemPermissionFields.isEditable,
    isDeletable: CommonSystemPermissionFields.isDeletable,
}).merge(AuditFieldsSchema.pick({
    createdBy: true,
    updatedBy: true,
    deletedBy: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
})).strict();

export const GetSystemPermissionListResponseSchema = z.object({
    records: z.array(SystemPermissionListBaseResponseSchema),
    totalRecords: z.number().min(0)
}).strict();