import { inject, Injectable, NgZone } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import {
  catchError,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import {
  AnnouncementAcknowledgeRequestSchema,
  AnnouncementAcknowledgeResponseSchema,
  AnnouncementAddRequestSchema,
  AnnouncementAddResponseSchema,
  AnnouncementDeleteRequestSchema,
  AnnouncementDeleteResponseSchema,
  AnnouncementDetailGetResponseSchema,
  AnnouncementEditRequestSchema,
  AnnouncementEditResponseSchema,
  AnnouncementGetRequestSchema,
  AnnouncementGetResponseSchema,
  AnnouncementUnacknowledgeGetResponseSchema,
} from '../schemas';
import {
  IAnnouncementAcknowledgeFormDto,
  IAnnouncementAcknowledgeResponseDto,
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
  IAnnouncementUnacknowledgeGetBaseResponseDto,
  IAnnouncementUnacknowledgeGetResponseDto,
} from '../types/announcement.dto';
import { ConfirmationDialogService } from '@shared/services';
import { SHOW_ANNOUNCEMENT_DIALOG_ACTION_CONFIG } from '../config';
import { EButtonActionType } from '@shared/types';
import { APP_CONFIG } from '@core/config';

const DIALOG_OPEN_DELAY_MS = 150; // defer so DOM/overlay is ready after app init

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly ngZone = inject(NgZone);

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

  acknowledgeAnnouncement(
    formData: IAnnouncementAcknowledgeFormDto
  ): Observable<IAnnouncementAcknowledgeResponseDto> {
    this.logger.logUserAction('Acknowledge Announcement Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ANNOUNCEMENT.ACKNOWLEDGE,
        {
          response: AnnouncementAcknowledgeResponseSchema,
          request: AnnouncementAcknowledgeRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAnnouncementAcknowledgeResponseDto) => {
          this.logger.logUserAction(
            'Acknowledge Announcement Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Acknowledge Announcement Error',
              error
            );
          } else {
            this.logger.logUserAction('Acknowledge Announcement Error', error);
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

  getUnacknowledgedAnnouncements(): Observable<IAnnouncementUnacknowledgeGetResponseDto> {
    this.logger.logUserAction('Get Unacknowledged Announcements Request');

    return this.apiService
      .getValidated(API_ROUTES.ANNOUNCEMENT.UNACKNOWLEDGE_LIST, {
        response: AnnouncementUnacknowledgeGetResponseSchema,
      })
      .pipe(
        tap((response: IAnnouncementUnacknowledgeGetResponseDto) => {
          this.logger.logUserAction(
            'Get Unacknowledged Announcements Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Unacknowledged Announcements Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Unacknowledged Announcements Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  loadUnacknowledgedAnnouncements(): Observable<IAnnouncementUnacknowledgeGetResponseDto> {
    return this.getUnacknowledgedAnnouncements().pipe(
      tap((response: IAnnouncementUnacknowledgeGetResponseDto) => {
        const { records, totalRecords } = response;

        if (totalRecords > 0 && records?.length) {
          const recordsCopy = records.slice();
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.ngZone.run(() => this.loadAnnouncementDialog(recordsCopy));
            }, DIALOG_OPEN_DELAY_MS);
          });
        }

        this.logger.logUserAction(
          'Unacknowledged announcement records loaded successfully',
          response
        );
      }),
      catchError(error => {
        this.logger.logUserAction(
          'Failed to load unacknowledged announcement records',
          error
        );
        return of({ records: [], totalRecords: 0 });
      })
    );
  }

  startPeriodicUnacknowledgedCheck(): void {
    timer(0, APP_CONFIG.ANNOUNCEMENT_CONFIG.UNACKNOWLEDGED_CHECK_INTERVAL_MS)
      .pipe(switchMap(() => this.loadUnacknowledgedAnnouncements()))
      .subscribe();
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

  private loadAnnouncementDialog(
    records: IAnnouncementUnacknowledgeGetBaseResponseDto[],
    totalCount?: number
  ): void {
    const total = totalCount ?? records.length;
    const firstRecord = records[0];
    const rest = records.slice(1);
    const currentIndex = total - records.length + 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: firstRecord,
      onDialogClose: () => {
        if (rest.length) {
          setTimeout(() => this.loadAnnouncementDialog(rest, total), 120);
        }
      },
    };

    const header =
      total > 1
        ? `${firstRecord.title} (${currentIndex}/${total})`
        : firstRecord.title;

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.VIEW,
      {
        ...SHOW_ANNOUNCEMENT_DIALOG_ACTION_CONFIG,
        dialogConfig: {
          ...SHOW_ANNOUNCEMENT_DIALOG_ACTION_CONFIG.dialogConfig,
          header,
        },
      },
      undefined,
      false,
      false,
      dynamicComponentInputs
    );
  }
}
