import { z } from "zod";
import { GetRolePermissionsResponseSchema } from "../dto/get-role-permissions.dto";

export type IGetRolePermissionsResponseDto = z.infer<typeof GetRolePermissionsResponseSchema>;