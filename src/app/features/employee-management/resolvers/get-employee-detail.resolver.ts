import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {
  IEmployeeDetailGetRequestDto,
  IEmployeeDetailGetResponseDto,
} from '../types/employee.dto';
import { EmployeeService } from '../services/employee.service';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  IEmployeeDetailResolverResponse,
  IEmployeePreloadedFiles,
} from '../types/employee.interface';
import { EMPLOYEE_MESSAGES } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class GetEmployeeDetailResolver
  implements Resolve<IEmployeeDetailResolverResponse | null>
{
  private readonly employeeService = inject(EmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IEmployeeDetailResolverResponse | null> {
    const employeeId = route.paramMap.get('employeeId');

    if (!employeeId) {
      this.navigateToEmployeeList();
      return of(null);
    }

    this.loadingService.show({
      title: EMPLOYEE_MESSAGES.LOADING.GET_DETAIL,
      message: EMPLOYEE_MESSAGES.LOADING_MESSAGES.GET_DETAIL,
    });

    const paramData = this.prepareParamData(employeeId);

    return this.employeeService.getEmployeeDetailById(paramData).pipe(
      switchMap((response: IEmployeeDetailGetResponseDto) => {
        const fileKeysWithType: { key: string; type: string }[] = [];

        Object.entries(response.documents).forEach(([docType, keys]) => {
          if (docType !== 'allDocumentKeys' && Array.isArray(keys)) {
            keys.forEach(key => {
              fileKeysWithType.push({ key, type: docType });
            });
          }
        });

        // Add profile picture
        if (response.profilePicture) {
          fileKeysWithType.push({
            key: response.profilePicture,
            type: 'PROFILE_PICTURE',
          });
        }

        // Extract just the keys for loading
        const fileKeys = fileKeysWithType.map(item => item.key);

        return this.attachmentsService.loadFilesFromKeys(fileKeys).pipe(
          switchMap(files => {
            // Group files by their document type using reduce
            const preloadedFiles = files.reduce((acc, file, index) => {
              const { type } = fileKeysWithType[index];

              if (type === 'PROFILE_PICTURE') {
                acc.PROFILE_PICTURE = [file];
              } else {
                const docType = type as keyof IEmployeePreloadedFiles;
                acc[docType] = [...(acc[docType] ?? []), file];
              }

              return acc;
            }, {} as IEmployeePreloadedFiles);

            return of({
              ...response,
              preloadedFiles,
            });
          })
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
        this.navigateToEmployeeList();
        return of(null);
      })
    );
  }

  private navigateToEmployeeList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.LIST];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(employeeId: string): IEmployeeDetailGetRequestDto {
    return {
      id: employeeId,
    };
  }
}
