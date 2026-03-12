import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {
  IExpenseDetailGetRequestDto,
  IExpenseDetailGetResponseDto,
} from '../types/expense.dto';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IExpenseDetailResolverResponse } from '../types/expense.interface';

@Injectable({
  providedIn: 'root',
})
export class GetExpenseDetailResolver
  implements Resolve<IExpenseDetailResolverResponse | null>
{
  private readonly expenseService = inject(ExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IExpenseDetailResolverResponse | null> {
    const expenseId = route.paramMap.get('expenseId');

    if (!expenseId) {
      this.navigateToExpenseList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Expense Detail',
      message: 'Please wait while we load the expense detail...',
    });

    const paramData = this.prepareParamData(expenseId);

    return this.expenseService.getExpenseDetailById(paramData).pipe(
      switchMap((response: IExpenseDetailGetResponseDto) => {
        const latestHistoryItem = response.history[response.history.length - 1];
        const fileKeys = latestHistoryItem?.fileKeys || [];

        return this.attachmentsService.loadFilesFromKeys(fileKeys).pipe(
          switchMap(files => {
            return of({
              ...response,
              preloadedFiles: files,
            });
          })
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
        this.navigateToExpenseList();
        return of(null);
      })
    );
  }

  private navigateToExpenseList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.LEDGER];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(expenseId: string): IExpenseDetailGetRequestDto {
    return {
      id: expenseId,
    };
  }
}
