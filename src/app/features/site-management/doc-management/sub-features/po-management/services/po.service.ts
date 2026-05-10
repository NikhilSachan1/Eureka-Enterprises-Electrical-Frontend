import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  ApprovePoRequestSchema,
  ApprovePoResponseSchema,
  DeletePoResponseSchema,
  PoDetailGetResponseSchema,
  RejectPoRequestSchema,
  RejectPoResponseSchema,
  PoGetRequestSchema,
  PoGetResponseSchema,
  UnlockRequestPoResponseSchema,
  UnlockRequestPoRequestSchema,
  UnlockGrantPoResponseSchema,
  UnlockRejectPoResponseSchema,
  AddPoResponseSchema,
  AddPoRequestSchema,
  EditPoRequestSchema,
  EditPoResponseSchema,
} from '../schemas';
import {
  IApprovePoFormDto,
  IApprovePoResponseDto,
  IPoDetailGetResponseDto,
  IPoGetFormDto,
  IPoGetResponseDto,
  IRejectPoFormDto,
  IRejectPoResponseDto,
  IDeletePoResponseDto,
  IUnlockGrantPoResponseDto,
  IUnlockRejectPoResponseDto,
  IUnlockRequestPoFormDto,
  IUnlockRequestPoResponseDto,
  IAddPoFormDto,
  IAddPoResponseDto,
  IEditPoFormDto,
  IEditPoResponseDto,
} from '../types/po.dto';

@Injectable({
  providedIn: 'root',
})
export class PoService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addPo(formData: IAddPoFormDto): Observable<IAddPoResponseDto> {
    this.logger.logUserAction('Add PO Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PO.ADD,
        {
          response: AddPoResponseSchema,
          request: AddPoRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddPoResponseDto) => {
          this.logger.logUserAction('Add PO Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add PO Error', error);
          } else {
            this.logger.logUserAction('Add PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editPo(
    formData: IEditPoFormDto,
    poId: string
  ): Observable<IEditPoResponseDto> {
    this.logger.logUserAction('Edit PO Request', { poId });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.PO.EDIT(poId),
        {
          response: EditPoResponseSchema,
          request: EditPoRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditPoResponseDto) => {
          this.logger.logUserAction('Edit PO Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit PO Error', error);
          } else {
            this.logger.logUserAction('Edit PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  approvePo(
    formData: IApprovePoFormDto,
    poId: string
  ): Observable<IApprovePoResponseDto> {
    this.logger.logUserAction('Approve PO Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PO.APPROVE(poId),
        {
          response: ApprovePoResponseSchema,
          request: ApprovePoRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IApprovePoResponseDto) => {
          this.logger.logUserAction('Approve PO Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Approve PO Error', error);
          } else {
            this.logger.logUserAction('Approve PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  rejectPo(
    formData: IRejectPoFormDto,
    poId: string
  ): Observable<IRejectPoResponseDto> {
    this.logger.logUserAction('Reject PO Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PO.REJECT(poId),
        {
          response: RejectPoResponseSchema,
          request: RejectPoRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRejectPoResponseDto) => {
          this.logger.logUserAction('Reject PO Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Reject PO Error', error);
          } else {
            this.logger.logUserAction('Reject PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestPo(
    formData: IUnlockRequestPoFormDto,
    poId: string
  ): Observable<IUnlockRequestPoResponseDto> {
    this.logger.logUserAction('Unlock Request PO Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PO.UNLOCK_REQUEST(poId),
        {
          response: UnlockRequestPoResponseSchema,
          request: UnlockRequestPoRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IUnlockRequestPoResponseDto) => {
          this.logger.logUserAction('Unlock Request PO Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request PO Error',
              error
            );
          } else {
            this.logger.logUserAction('Unlock Request PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockGrantPo(poId: string): Observable<IUnlockGrantPoResponseDto> {
    this.logger.logUserAction('Unlock Grant PO Request');

    return this.apiService
      .postValidated(API_ROUTES.SITE.DOCUMENT.PO.UNLOCK_REQUEST_GRANT(poId), {
        response: UnlockGrantPoResponseSchema,
      })
      .pipe(
        tap((response: IUnlockGrantPoResponseDto) => {
          this.logger.logUserAction('Unlock Grant PO Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Unlock Grant PO Error', error);
          } else {
            this.logger.logUserAction('Unlock Grant PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestRejectPo(poId: string): Observable<IUnlockRejectPoResponseDto> {
    this.logger.logUserAction('Unlock Request Reject PO Request');

    return this.apiService
      .postValidated(API_ROUTES.SITE.DOCUMENT.PO.UNLOCK_REQUEST_REJECT(poId), {
        response: UnlockRejectPoResponseSchema,
      })
      .pipe(
        tap((response: IUnlockRejectPoResponseDto) => {
          this.logger.logUserAction(
            'Unlock Request Reject PO Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request Reject PO Error',
              error
            );
          } else {
            this.logger.logUserAction('Unlock Request Reject PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deletePo(poId: string): Observable<IDeletePoResponseDto> {
    this.logger.logUserAction('Delete PO Request');

    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DOCUMENT.PO.DELETE(poId), {
        response: DeletePoResponseSchema,
      })
      .pipe(
        tap((response: IDeletePoResponseDto) => {
          this.logger.logUserAction('Delete PO Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete PO Error', error);
          } else {
            this.logger.logUserAction('Delete PO Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getPoList(params?: IPoGetFormDto): Observable<IPoGetResponseDto> {
    this.logger.logUserAction('Get PO List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.PO.LIST,
        {
          response: PoGetResponseSchema,
          request: PoGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IPoGetResponseDto) => {
          this.logger.logUserAction('Get PO List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get PO List Error', error);
          } else {
            this.logger.logUserAction('Get PO List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getPoDetailById(poId: string): Observable<IPoDetailGetResponseDto> {
    this.logger.logUserAction('Get PO Detail By Id Request', { poId });

    return this.apiService
      .getValidated(API_ROUTES.SITE.DOCUMENT.PO.GET_PO_BY_ID(poId), {
        response: PoDetailGetResponseSchema,
      })
      .pipe(
        tap((response: IPoDetailGetResponseDto) => {
          this.logger.logUserAction('Get PO Detail By Id Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get PO Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get PO Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
