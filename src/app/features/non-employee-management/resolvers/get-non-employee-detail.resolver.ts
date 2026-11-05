import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { NON_EMPLOYEE_TAB_QUERY_PARAMS } from '../constants/non-employee.constants';
import { INonEmployeeGetBaseResponseDto } from '../schemas/non-employee.schema';
import { NonEmployeeService } from '../services/non-employee.service';

export interface INonEmployeeDetailResolverResponse
  extends INonEmployeeGetBaseResponseDto {
  preloadedPicture?: File[];
}

/** Loads the record and its picture for the edit form. Goes back to the list if it cannot. */
export const getNonEmployeeDetailResolver: ResolveFn<
  INonEmployeeDetailResolverResponse | null
> = route => {
  const nonEmployeeService = inject(NonEmployeeService);
  const attachmentsService = inject(AttachmentsService);
  const loadingService = inject(LoadingService);
  const routerNavigationService = inject(RouterNavigationService);

  loadingService.show({
    title: 'Loading details',
    message: 'This will just take a moment.',
  });

  return nonEmployeeService
    .getNonEmployeeById(route.paramMap.get('nonEmployeeId') ?? '')
    .pipe(
      switchMap(detail =>
        detail.profilePicture
          ? attachmentsService.loadFilesFromKeys([detail.profilePicture]).pipe(
              map(files => ({ ...detail, preloadedPicture: files })),
              catchError(() => of(detail))
            )
          : of(detail)
      ),
      catchError(() => {
        void routerNavigationService.navigateWithQueryParams(
          [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.LIST],
          NON_EMPLOYEE_TAB_QUERY_PARAMS
        );
        return of(null);
      }),
      finalize(() => loadingService.hide())
    );
};
