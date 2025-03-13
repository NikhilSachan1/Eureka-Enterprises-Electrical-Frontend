import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

export const permissionGuard: CanActivateFn = (route) => {
    const permissionService = inject(PermissionService);
    const router = inject(Router);

    const requiredPermission = route.data['permission'];

    if (permissionService.hasPermission(requiredPermission)) {
        return true;
    } else {
        alert('unauthorized access')
        // router.navigate(['/unauthorized']);
        return false;
    }
};