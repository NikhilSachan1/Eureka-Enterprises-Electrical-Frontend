import { inject, Injectable, NgZone } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService } from '@core/services';
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
  private readonly apiService = inject(ApiService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly ngZone = inject(NgZone);

  addAnnouncement(
    formData: IAnnouncementAddFormDto
  ): Observable<IAnnouncementAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.ANNOUNCEMENT.ADD,
        {
          response: AnnouncementAddResponseSchema,
          request: AnnouncementAddRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editAnnouncement(
    formData: IAnnouncementEditFormDto,
    announcementId: string
  ): Observable<IAnnouncementEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.ANNOUNCEMENT.EDIT(announcementId),
        {
          response: AnnouncementEditResponseSchema,
          request: AnnouncementEditRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteAnnouncement(
    formData: IAnnouncementDeleteFormDto
  ): Observable<IAnnouncementDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.ANNOUNCEMENT.DELETE,
        {
          response: AnnouncementDeleteResponseSchema,
          request: AnnouncementDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  acknowledgeAnnouncement(
    formData: IAnnouncementAcknowledgeFormDto
  ): Observable<IAnnouncementAcknowledgeResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.ANNOUNCEMENT.ACKNOWLEDGE,
        {
          response: AnnouncementAcknowledgeResponseSchema,
          request: AnnouncementAcknowledgeRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getAnnouncementList(
    params?: IAnnouncementGetFormDto
  ): Observable<IAnnouncementGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.ANNOUNCEMENT.LIST,
        {
          response: AnnouncementGetResponseSchema,
          request: AnnouncementGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getUnacknowledgedAnnouncements(): Observable<IAnnouncementUnacknowledgeGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.ANNOUNCEMENT.UNACKNOWLEDGE_LIST, {
        response: AnnouncementUnacknowledgeGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
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
      }),
      catchError(() => of({ records: [], totalRecords: 0 }))
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
    return this.apiService
      .getValidated(
        API_ROUTES.ANNOUNCEMENT.GET_ANNOUNCEMENT_BY_ID(params.announcementId),
        {
          response: AnnouncementDetailGetResponseSchema,
        }
      )
      .pipe(catchError(error => throwError(() => error)));
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
