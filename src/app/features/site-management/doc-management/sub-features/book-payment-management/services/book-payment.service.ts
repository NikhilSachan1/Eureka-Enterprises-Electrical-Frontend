import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddBookPaymentRequestSchema,
  AddBookPaymentResponseSchema,
  BookPaymentDetailGetResponseSchema,
  BookPaymentGetRequestSchema,
  BookPaymentGetResponseSchema,
  DeleteBookPaymentResponseSchema,
  EditBookPaymentRequestSchema,
  EditBookPaymentResponseSchema,
  BookPaymentDropdownGetRequestSchema,
  BookPaymentDropdownGetResponseSchema,
  UnlockRequestBookPaymentRequestSchema,
  UnlockRequestBookPaymentResponseSchema,
  UnlockGrantBookPaymentResponseSchema,
  UnlockRejectBookPaymentResponseSchema,
} from '../schemas';
import {
  IAddBookPaymentFormDto,
  IAddBookPaymentResponseDto,
  IBookPaymentDetailGetResponseDto,
  IBookPaymentGetFormDto,
  IBookPaymentGetResponseDto,
  IDeleteBookPaymentResponseDto,
  IEditBookPaymentFormDto,
  IEditBookPaymentResponseDto,
  IBookPaymentDropdownGetRequestDto,
  IBookPaymentDropdownGetResponseDto,
  IUnlockRequestBookPaymentFormDto,
  IUnlockRequestBookPaymentResponseDto,
  IUnlockGrantBookPaymentResponseDto,
  IUnlockRejectBookPaymentResponseDto,
} from '../types/book-payment.dto';

@Injectable({
  providedIn: 'root',
})
export class BookPaymentService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addBookPayment(
    formData: IAddBookPaymentFormDto
  ): Observable<IAddBookPaymentResponseDto> {
    this.logger.logUserAction('Add Book Payment Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.ADD,
        {
          response: AddBookPaymentResponseSchema,
          request: AddBookPaymentRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddBookPaymentResponseDto) => {
          this.logger.logUserAction('Add Book Payment Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Book Payment Error', error);
          } else {
            this.logger.logUserAction('Add Book Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editBookPayment(
    formData: IEditBookPaymentFormDto,
    id: string
  ): Observable<IEditBookPaymentResponseDto> {
    this.logger.logUserAction('Edit Book Payment Request', { id });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.EDIT(id),
        {
          response: EditBookPaymentResponseSchema,
          request: EditBookPaymentRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditBookPaymentResponseDto) => {
          this.logger.logUserAction('Edit Book Payment Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Book Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Book Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestBookPayment(
    formData: IUnlockRequestBookPaymentFormDto,
    bookPaymentId: string
  ): Observable<IUnlockRequestBookPaymentResponseDto> {
    this.logger.logUserAction('Unlock Request Book Payment Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.UNLOCK_REQUEST(bookPaymentId),
        {
          response: UnlockRequestBookPaymentResponseSchema,
          request: UnlockRequestBookPaymentRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IUnlockRequestBookPaymentResponseDto) => {
          this.logger.logUserAction(
            'Unlock Request Book Payment Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request Book Payment Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Unlock Request Book Payment Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  unlockGrantBookPayment(
    bookPaymentId: string
  ): Observable<IUnlockGrantBookPaymentResponseDto> {
    this.logger.logUserAction('Unlock Grant Book Payment Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.UNLOCK_REQUEST_GRANT(
          bookPaymentId
        ),
        {
          response: UnlockGrantBookPaymentResponseSchema,
        }
      )
      .pipe(
        tap((response: IUnlockGrantBookPaymentResponseDto) => {
          this.logger.logUserAction(
            'Unlock Grant Book Payment Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Grant Book Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Unlock Grant Book Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestRejectBookPayment(
    bookPaymentId: string
  ): Observable<IUnlockRejectBookPaymentResponseDto> {
    this.logger.logUserAction('Unlock Request Reject Book Payment Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.UNLOCK_REQUEST_REJECT(
          bookPaymentId
        ),
        {
          response: UnlockRejectBookPaymentResponseSchema,
        }
      )
      .pipe(
        tap((response: IUnlockRejectBookPaymentResponseDto) => {
          this.logger.logUserAction(
            'Unlock Request Reject Book Payment Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request Reject Book Payment Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Unlock Request Reject Book Payment Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  deleteBookPayment(
    bookPaymentId: string
  ): Observable<IDeleteBookPaymentResponseDto> {
    this.logger.logUserAction('Delete Book Payment Request', { bookPaymentId });

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.DELETE(bookPaymentId),
        {
          response: DeleteBookPaymentResponseSchema,
        }
      )
      .pipe(
        tap((response: IDeleteBookPaymentResponseDto) => {
          this.logger.logUserAction('Delete Book Payment Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Book Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Book Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getBookPaymentList(
    params?: IBookPaymentGetFormDto
  ): Observable<IBookPaymentGetResponseDto> {
    this.logger.logUserAction('Get Book Payment List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.LIST,
        {
          response: BookPaymentGetResponseSchema,
          request: BookPaymentGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IBookPaymentGetResponseDto) => {
          this.logger.logUserAction('Get Book Payment List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Book Payment List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Book Payment List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getBookPaymentDetailById(
    bookPaymentId: string
  ): Observable<IBookPaymentDetailGetResponseDto> {
    this.logger.logUserAction('Get Book Payment Detail Request', {
      bookPaymentId,
    });

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.GET_BY_ID(bookPaymentId),
        {
          response: BookPaymentDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IBookPaymentDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Book Payment Detail Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Book Payment Detail Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Book Payment Detail Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getBookPaymentDropdown(
    params: IBookPaymentDropdownGetRequestDto
  ): Observable<IBookPaymentDropdownGetResponseDto> {
    this.logger.logUserAction('Get Book Payment Dropdown Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.BOOK_PAYMENT.DROPDOWN,
        {
          response: BookPaymentDropdownGetResponseSchema,
          request: BookPaymentDropdownGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IBookPaymentDropdownGetResponseDto) => {
          this.logger.logUserAction(
            'Get Book Payment Dropdown Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Book Payment Dropdown Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Book Payment Dropdown Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
