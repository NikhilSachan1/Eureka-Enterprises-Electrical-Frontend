import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  DocAddRequestSchema,
  DocAddResponseSchema,
  DocDeleteResponseSchema,
  DocEditRequestSchema,
  DocEditResponseSchema,
  DocGetRequestSchema,
  DocGetResponseSchema,
} from '../schemas';
import {
  IDocAddFormDto,
  IDocAddResponseDto,
  IDocDeleteResponseDto,
  IDocEditFormDto,
  IDocEditResponseDto,
  IDocGetFormDto,
  IDocGetResponseDto,
} from '../types/doc.dto';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addDoc(formData: IDocAddFormDto): Observable<IDocAddResponseDto> {
    this.logger.logUserAction('Add Doc Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOC.ADD,
        {
          response: DocAddResponseSchema,
          request: DocAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IDocAddResponseDto) => {
          this.logger.logUserAction('Add Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Doc Error', error);
          } else {
            this.logger.logUserAction('Add Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editDoc(
    formData: IDocEditFormDto,
    docId: string
  ): Observable<IDocEditResponseDto> {
    this.logger.logUserAction('Edit Doc Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOC.EDIT(docId),
        {
          response: DocEditResponseSchema,
          request: DocEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IDocEditResponseDto) => {
          this.logger.logUserAction('Edit Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Doc Error', error);
          } else {
            this.logger.logUserAction('Edit Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteDoc(docId: string): Observable<IDocDeleteResponseDto> {
    this.logger.logUserAction('Delete Doc Request');

    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DOC.DELETE(docId), {
        response: DocDeleteResponseSchema,
      })
      .pipe(
        tap((response: IDocDeleteResponseDto) => {
          this.logger.logUserAction('Delete Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Doc Error', error);
          } else {
            this.logger.logUserAction('Delete Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getDocList(params?: IDocGetFormDto): Observable<IDocGetResponseDto> {
    this.logger.logUserAction('Get Doc List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOC.LIST,
        {
          response: DocGetResponseSchema,
          request: DocGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IDocGetResponseDto) => {
          this.logger.logUserAction('Get Doc List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Doc List Error', error);
          } else {
            this.logger.logUserAction('Get Doc List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
