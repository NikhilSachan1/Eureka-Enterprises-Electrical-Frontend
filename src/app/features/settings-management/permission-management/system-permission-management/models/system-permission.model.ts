import { PartialExcept } from "../../../../../shared/utility/typescript.utility";
import { IGetSingleSystemPermissionListResponseDto } from "./system-permission.api.model";

export interface IModulePermission {
    readonly id: string;
    readonly moduleName: string;
    permissions: PartialExcept<IGetSingleSystemPermissionListResponseDto, 'id' | 'description' | 'label'>[];
}