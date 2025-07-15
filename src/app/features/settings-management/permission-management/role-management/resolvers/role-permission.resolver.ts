import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { IGetRolePermissionRequestDto, IGetRolePermissionsResponseDto } from "../models/role-permission.api.model";
import { RoleManagementService } from "../services/role-management.service";
import { Observable, catchError, finalize, of, tap } from "rxjs";
import { LoggerService } from "../../../../../core/services/logger.service";
import { LoadingService, RouterNavigationService } from "../../../../../shared/services";
import { ROUTE_BASE_PATHS } from "../../../../../shared/constants/route.constants";

@Injectable({
    providedIn: 'root'
})
export class RolePermissionResolver implements Resolve<IGetRolePermissionsResponseDto | null> {
    
    private readonly roleManagementService = inject(RoleManagementService);
    private readonly logger = inject(LoggerService);
    private readonly routerNavigationService = inject(RouterNavigationService);
    private readonly loadingService = inject(LoadingService);

    resolve(
        route: ActivatedRouteSnapshot,
    ): Observable<IGetRolePermissionsResponseDto | null> {
        
        const roleId = route.paramMap.get('roleId');
        
        this.logger.logUserAction('Role Permission Resolver: Starting resolution');
    
        if (!roleId) {
            this.logger.logUserAction('Role Permission Resolver: No roleId found in route');
            this.navigateToRoleList();
            return of(null);
        }
    
        this.loadingService.show({
            title: 'Loading Role Permission',
            message: 'Please wait while we load the role permission...',
        });

        const paramData = this.prepareParamData(roleId);
    
        return this.roleManagementService.getRolePermission(paramData).pipe(
            tap((response: IGetRolePermissionsResponseDto) => {
                this.logger.logUserAction('Role Permission Resolver: Data resolved successfully', response.records);
            }),
            finalize(() => {
                this.loadingService.hide();
            }),
            catchError((error: any) => {
                this.logger.logUserAction('Role Permission Resolver: Error resolving data', error);
                this.navigateToRoleList();
                return of(null);
            })
        );
    }

    private navigateToRoleList(): void {
        const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
        ];
        this.routerNavigationService.navigateToRoute(routeSegments);
    }

    private prepareParamData(roleId: string): IGetRolePermissionRequestDto {
        return {
            roleId,
            isActive: true,
        };
    }
}