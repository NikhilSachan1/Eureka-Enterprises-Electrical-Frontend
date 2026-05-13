import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  ApproveJmcRequestSchema,
  ApproveJmcResponseSchema,
  DeleteJmcResponseSchema,
  JmcDetailGetResponseSchema,
  RejectJmcRequestSchema,
  RejectJmcResponseSchema,
  JmcGetRequestSchema,
  JmcGetResponseSchema,
  UnlockRequestJmcResponseSchema,
  UnlockRequestJmcRequestSchema,
  UnlockGrantJmcResponseSchema,
  UnlockRejectJmcResponseSchema,
  AddJmcResponseSchema,
  AddJmcRequestSchema,
  EditJmcRequestSchema,
  EditJmcResponseSchema,
  JmcDropdownGetRequestSchema,
  JmcDropdownGetResponseSchema,
} from '../schemas';
import {
  IApproveJmcFormDto,
  IApproveJmcResponseDto,
  IJmcDetailGetResponseDto,
  IJmcGetFormDto,
  IJmcGetResponseDto,
  IRejectJmcFormDto,
  IRejectJmcResponseDto,
  IDeleteJmcResponseDto,
  IUnlockGrantJmcResponseDto,
  IUnlockRejectJmcResponseDto,
  IUnlockRequestJmcFormDto,
  IUnlockRequestJmcResponseDto,
  IAddJmcFormDto,
  IAddJmcResponseDto,
  IEditJmcFormDto,
  IEditJmcResponseDto,
  IJmcDropdownGetRequestDto,
  IJmcDropdownGetResponseDto,
} from '../types/jmc.dto';

@Injectable({
  providedIn: 'root',
})
export class JmcService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addJmc(formData: IAddJmcFormDto): Observable<IAddJmcResponseDto> {
    this.logger.logUserAction('Add JMC Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.ADD,
        {
          response: AddJmcResponseSchema,
          request: AddJmcRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddJmcResponseDto) => {
          this.logger.logUserAction('Add JMC Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add JMC Error', error);
          } else {
            this.logger.logUserAction('Add JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editJmc(
    formData: IEditJmcFormDto,
    jmcId: string
  ): Observable<IEditJmcResponseDto> {
    this.logger.logUserAction('Edit JMC Request', { jmcId });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.EDIT(jmcId),
        {
          response: EditJmcResponseSchema,
          request: EditJmcRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditJmcResponseDto) => {
          this.logger.logUserAction('Edit JMC Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit JMC Error', error);
          } else {
            this.logger.logUserAction('Edit JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  approveJmc(
    formData: IApproveJmcFormDto,
    jmcId: string
  ): Observable<IApproveJmcResponseDto> {
    this.logger.logUserAction('Approve JMC Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.APPROVE(jmcId),
        {
          response: ApproveJmcResponseSchema,
          request: ApproveJmcRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IApproveJmcResponseDto) => {
          this.logger.logUserAction('Approve JMC Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Approve JMC Error', error);
          } else {
            this.logger.logUserAction('Approve JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  rejectJmc(
    formData: IRejectJmcFormDto,
    jmcId: string
  ): Observable<IRejectJmcResponseDto> {
    this.logger.logUserAction('Reject JMC Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.REJECT(jmcId),
        {
          response: RejectJmcResponseSchema,
          request: RejectJmcRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRejectJmcResponseDto) => {
          this.logger.logUserAction('Reject JMC Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Reject JMC Error', error);
          } else {
            this.logger.logUserAction('Reject JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestJmc(
    formData: IUnlockRequestJmcFormDto,
    jmcId: string
  ): Observable<IUnlockRequestJmcResponseDto> {
    this.logger.logUserAction('Unlock Request JMC Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.UNLOCK_REQUEST(jmcId),
        {
          response: UnlockRequestJmcResponseSchema,
          request: UnlockRequestJmcRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IUnlockRequestJmcResponseDto) => {
          this.logger.logUserAction('Unlock Request JMC Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request JMC Error',
              error
            );
          } else {
            this.logger.logUserAction('Unlock Request JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockGrantJmc(jmcId: string): Observable<IUnlockGrantJmcResponseDto> {
    this.logger.logUserAction('Unlock Grant JMC Request');

    return this.apiService
      .postValidated(API_ROUTES.SITE.DOCUMENT.JMC.UNLOCK_REQUEST_GRANT(jmcId), {
        response: UnlockGrantJmcResponseSchema,
      })
      .pipe(
        tap((response: IUnlockGrantJmcResponseDto) => {
          this.logger.logUserAction('Unlock Grant JMC Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Unlock Grant JMC Error', error);
          } else {
            this.logger.logUserAction('Unlock Grant JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestRejectJmc(
    jmcId: string
  ): Observable<IUnlockRejectJmcResponseDto> {
    this.logger.logUserAction('Unlock Request Reject JMC Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.UNLOCK_REQUEST_REJECT(jmcId),
        {
          response: UnlockRejectJmcResponseSchema,
        }
      )
      .pipe(
        tap((response: IUnlockRejectJmcResponseDto) => {
          this.logger.logUserAction(
            'Unlock Request Reject JMC Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request Reject JMC Error',
              error
            );
          } else {
            this.logger.logUserAction('Unlock Request Reject JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteJmc(jmcId: string): Observable<IDeleteJmcResponseDto> {
    this.logger.logUserAction('Delete JMC Request');

    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DOCUMENT.JMC.DELETE(jmcId), {
        response: DeleteJmcResponseSchema,
      })
      .pipe(
        tap((response: IDeleteJmcResponseDto) => {
          this.logger.logUserAction('Delete JMC Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete JMC Error', error);
          } else {
            this.logger.logUserAction('Delete JMC Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getJmcDropdown(
    params: IJmcDropdownGetRequestDto
  ): Observable<IJmcDropdownGetResponseDto> {
    this.logger.logUserAction('Get JMC Dropdown Request', params);

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.DROPDOWN,
        {
          response: JmcDropdownGetResponseSchema,
          request: JmcDropdownGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IJmcDropdownGetResponseDto) => {
          this.logger.logUserAction('Get JMC Dropdown Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get JMC Dropdown Error', error);
          } else {
            this.logger.logUserAction('Get JMC Dropdown Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getJmcList(params?: IJmcGetFormDto): Observable<IJmcGetResponseDto> {
    this.logger.logUserAction('Get JMC List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.JMC.LIST,
        {
          response: JmcGetResponseSchema,
          request: JmcGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IJmcGetResponseDto) => {
          this.logger.logUserAction('Get JMC List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get JMC List Error', error);
          } else {
            this.logger.logUserAction('Get JMC List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getJmcDetailById(jmcId: string): Observable<IJmcDetailGetResponseDto> {
    this.logger.logUserAction('Get JMC Detail By Id Request', { jmcId });

    return this.apiService
      .getValidated(API_ROUTES.SITE.DOCUMENT.JMC.GET_JMC_BY_ID(jmcId), {
        response: JmcDetailGetResponseSchema,
      })
      .pipe(
        tap((response: IJmcDetailGetResponseDto) => {
          this.logger.logUserAction('Get JMC Detail By Id Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get JMC Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get JMC Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
