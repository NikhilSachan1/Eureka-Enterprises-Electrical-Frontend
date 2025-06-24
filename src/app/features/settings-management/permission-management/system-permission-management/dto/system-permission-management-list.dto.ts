import { z } from "zod";
import { AuditFieldsSchema } from "../../../../../shared/api-response-audit-fields.dto";
import { toTitleCase, toSentenceCase } from "../../../../../shared/utility/string.util";
import { CommonSystemPermissionFields } from "./common-system-permission-management.dto";

export const SystemPermissionListBaseResponseSchema = z.object({
    id: z
        .string()
        .uuid(),
    name: CommonSystemPermissionFields.name.transform((val) => toTitleCase(val)),
    module: CommonSystemPermissionFields.module.transform((val) => toTitleCase(val)),
    label: CommonSystemPermissionFields.label.transform((val) => toTitleCase(val)),
    description: CommonSystemPermissionFields.description.transform((val) => toSentenceCase(val)),
}).merge(AuditFieldsSchema).strict();

export const GetSystemPermissionListResponseSchema = z.object({
    records: z.array(SystemPermissionListBaseResponseSchema),
    totalRecords: z.number().min(0)
}).strict();