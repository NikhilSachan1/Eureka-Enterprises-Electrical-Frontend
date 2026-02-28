import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AnnouncementAddRequestSchema,
  AnnouncementAddResponseSchema,
  AnnouncementDeleteRequestSchema,
  AnnouncementDeleteResponseSchema,
  AnnouncementDetailGetResponseSchema,
  AnnouncementEditRequestSchema,
  AnnouncementEditResponseSchema,
  AnnouncementGetRequestSchema,
  AnnouncementGetResponseSchema,
} from '../schemas';
import {
  IAnnouncementAddFormDto,
  IAnnouncementAddResponseDto,
  IAnnouncementDeleteFormDto,
  IAnnouncementDeleteResponseDto,
  IAnnouncementDetailGetFormDto,
  IAnnouncementDetailGetResponseDto,
  IAnnouncementEditFormDto,
  IAnnouncementEditResponseDto,
  IAnnouncementGetFormDto,
  IAnnouncementGetResponseDto,
} from '../types/announcement.dto';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addAnnouncement(
    formData: IAnnouncementAddFormDto
  ): Observable<IAnnouncementAddResponseDto> {
    this.logger.logUserAction('Add Announcement Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ANNOUNCEMENT.ADD,
        {
          response: AnnouncementAddResponseSchema,
          request: AnnouncementAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAnnouncementAddResponseDto) => {
          this.logger.logUserAction('Add Announcement Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Announcement Error', error);
          } else {
            this.logger.logUserAction('Add Announcement Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editAnnouncement(
    formData: IAnnouncementEditFormDto,
    announcementId: string
  ): Observable<IAnnouncementEditResponseDto> {
    this.logger.logUserAction('Edit Announcement Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.ANNOUNCEMENT.EDIT(announcementId),
        {
          response: AnnouncementEditResponseSchema,
          request: AnnouncementEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAnnouncementEditResponseDto) => {
          this.logger.logUserAction('Edit Announcement Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Announcement Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Announcement Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteAnnouncement(
    formData: IAnnouncementDeleteFormDto
  ): Observable<IAnnouncementDeleteResponseDto> {
    this.logger.logUserAction('Delete Announcement Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.ANNOUNCEMENT.DELETE,
        {
          response: AnnouncementDeleteResponseSchema,
          request: AnnouncementDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAnnouncementDeleteResponseDto) => {
          this.logger.logUserAction('Delete Announcement Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Announcement Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Announcement Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAnnouncementList(
    params?: IAnnouncementGetFormDto
  ): Observable<IAnnouncementGetResponseDto> {
    this.logger.logUserAction('Get Announcement List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ANNOUNCEMENT.LIST,
        {
          response: AnnouncementGetResponseSchema,
          request: AnnouncementGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IAnnouncementGetResponseDto) => {
          this.logger.logUserAction('Get Announcement List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Announcement List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Announcement List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAnnouncementDetailById(
    params: IAnnouncementDetailGetFormDto
  ): Observable<IAnnouncementDetailGetResponseDto> {
    this.logger.logUserAction('Get Announcement Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ANNOUNCEMENT.GET_ANNOUNCEMENT_BY_ID(params.announcementId),
        {
          response: AnnouncementDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IAnnouncementDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Announcement Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Announcement Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Announcement Detail By Id Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
