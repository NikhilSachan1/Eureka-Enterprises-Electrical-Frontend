import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { catchError, finalize, Observable, of } from 'rxjs';
import { PaymentSheetService } from '../services/payment-sheet.service';
import {
  IPaymentSheetDetailGetFormDto,
  IPaymentSheetDetailGetResponseDto,
} from '../types/payment-sheet.dto';

@Injectable({
  providedIn: 'root',
})
export class GetPaymentSheetDetailResolver
  implements Resolve<IPaymentSheetDetailGetResponseDto | null>
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IPaymentSheetDetailGetResponseDto | null> {
    const paymentSheetId = route.paramMap.get('paymentSheetId');

    this.logger.logUserAction(
      'Get Payment Sheet Detail Resolver: Starting resolution',
      { paymentSheetId }
    );

    if (!paymentSheetId) {
      this.navigateToPaymentSheetList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Payment Sheet',
      message:
        "We're loading the payment sheet details. This will just take a moment.",
    });

    const paramData: IPaymentSheetDetailGetFormDto = { paymentSheetId };

    return this.paymentSheetService.getPaymentSheetDetailById(paramData).pipe(
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Payment Sheet Detail Resolver: Error resolving data',
          error
        );
        this.navigateToPaymentSheetList();
        return of(null);
      })
    );
  }

  private navigateToPaymentSheetList(): void {
    void this.routerNavigationService.navigateToRoute([
      ROUTE_BASE_PATHS.PAYMENT_HUB,
      ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS,
    ]);
  }
}
