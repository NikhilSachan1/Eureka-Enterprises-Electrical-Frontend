import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddBankTransferRequestSchema,
  AddBankTransferResponseSchema,
  BankTransferDetailGetResponseSchema,
  BankTransferGetRequestSchema,
  BankTransferGetResponseSchema,
  DeleteBankTransferResponseSchema,
  EditBankTransferRequestSchema,
  EditBankTransferResponseSchema,
  SendEmailBankTransferRequestSchema,
  SendEmailBankTransferResponseSchema,
} from '../schemas';
import {
  IAddBankTransferFormDto,
  IAddBankTransferResponseDto,
  IBankTransferDetailGetResponseDto,
  IBankTransferGetFormDto,
  IBankTransferGetResponseDto,
  IDeleteBankTransferResponseDto,
  IEditBankTransferFormDto,
  IEditBankTransferResponseDto,
  ISendEmailBankTransferFormDto,
  ISendEmailBankTransferResponseDto,
} from '../types/bank-transfer.dto';

@Injectable({
  providedIn: 'root',
})
export class BankTransferService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addBankTransfer(
    formData: IAddBankTransferFormDto
  ): Observable<IAddBankTransferResponseDto> {
    this.logger.logUserAction('Add Bank Transfer Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.BANK_TRANSFER.ADD,
        {
          response: AddBankTransferResponseSchema,
          request: AddBankTransferRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddBankTransferResponseDto) => {
          this.logger.logUserAction('Add Bank Transfer Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Bank Transfer Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Bank Transfer Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editBankTransfer(
    formData: IEditBankTransferFormDto,
    id: string
  ): Observable<IEditBankTransferResponseDto> {
    this.logger.logUserAction('Edit Bank Transfer Request', { id });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.BANK_TRANSFER.EDIT(id),
        {
          response: EditBankTransferResponseSchema,
          request: EditBankTransferRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditBankTransferResponseDto) => {
          this.logger.logUserAction('Edit Bank Transfer Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Bank Transfer Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Bank Transfer Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteBankTransfer(
    bankTransferId: string
  ): Observable<IDeleteBankTransferResponseDto> {
    this.logger.logUserAction('Delete Bank Transfer Request', {
      bankTransferId,
    });

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.DOCUMENT.BANK_TRANSFER.DELETE(bankTransferId),
        {
          response: DeleteBankTransferResponseSchema,
        }
      )
      .pipe(
        tap((response: IDeleteBankTransferResponseDto) => {
          this.logger.logUserAction('Delete Bank Transfer Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Bank Transfer Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Bank Transfer Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getBankTransferList(
    params?: IBankTransferGetFormDto
  ): Observable<IBankTransferGetResponseDto> {
    this.logger.logUserAction('Get Bank Transfer List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.BANK_TRANSFER.LIST,
        {
          response: BankTransferGetResponseSchema,
          request: BankTransferGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IBankTransferGetResponseDto) => {
          this.logger.logUserAction(
            'Get Bank Transfer List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Bank Transfer List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Bank Transfer List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  sendPaymentAdviceEmail(
    paymentAdviceId: string,
    formData: ISendEmailBankTransferFormDto
  ): Observable<ISendEmailBankTransferResponseDto> {
    this.logger.logUserAction('Send Payment Advice Email Request', {
      paymentAdviceId,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_ADVICE.EMAIL(paymentAdviceId),
        {
          response: SendEmailBankTransferResponseSchema,
          request: SendEmailBankTransferRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ISendEmailBankTransferResponseDto) => {
          this.logger.logUserAction(
            'Send Payment Advice Email Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Send Payment Advice Email Error',
              error
            );
          } else {
            this.logger.logUserAction('Send Payment Advice Email Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getBankTransferDetailById(
    bankTransferId: string
  ): Observable<IBankTransferDetailGetResponseDto> {
    this.logger.logUserAction('Get Bank Transfer Detail Request', {
      bankTransferId,
    });

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.BANK_TRANSFER.GET_BY_ID(bankTransferId),
        {
          response: BankTransferDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IBankTransferDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Bank Transfer Detail Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Bank Transfer Detail Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Bank Transfer Detail Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
