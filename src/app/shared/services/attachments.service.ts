import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import {
  AttachmentsGetRequestSchema,
  AttachmentsGetResponseSchema,
} from '@shared/schemas';
import { IAttachmentsGetResponseDto } from '@shared/types';
import {
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getFullMediaUrl(key: string): Observable<IAttachmentsGetResponseDto> {
    this.logger.logUserAction('Get Image URLs Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ATTACHMENTS.GET_FILE_URL,
        AttachmentsGetResponseSchema,
        { key },
        AttachmentsGetRequestSchema
      )
      .pipe(
        tap((response: IAttachmentsGetResponseDto) => {
          this.logger.logUserAction('Get Full Media URL Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Full Media URL Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Full Media URL Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  loadFilesFromKeys(fileKeys: string[]): Observable<File[]> {
    if (!fileKeys || fileKeys.length === 0) {
      return of([]);
    }

    this.logger.logUserAction('Loading files from keys:', fileKeys);

    // Step 1: Fetch all file URLs in parallel using forkJoin
    const fileUrlRequests = fileKeys.map(key => this.getFullMediaUrl(key));

    return forkJoin(fileUrlRequests).pipe(
      // Step 2: Download all files in parallel using forkJoin
      switchMap(responses => {
        const downloadRequests = responses.map((response, index) =>
          this.downloadFile(response.url, fileKeys[index], index)
        );

        // forkJoin waits for all downloads to complete in parallel
        return forkJoin(downloadRequests);
      }),
      // Step 3: Filter out failed downloads (null values)
      map(files => files.filter((file): file is File => file !== null)),
      tap(files => {
        this.logger.logUserAction(
          `Files loaded successfully: ${files.length}/${fileKeys.length}`,
          files
        );
      }),
      catchError(error => {
        this.logger.error('Failed to load files from keys', error);
        return of([]);
      })
    );
  }

  /**
   * Download a single file from URL and convert to File object (Pure RxJS)
   * @param fileUrl The URL to download from
   * @param fileKey The file key for naming
   * @param index Index for fallback naming
   * @returns Observable<File | null>
   */
  private downloadFile(
    fileUrl: string,
    fileKey: string,
    index: number
  ): Observable<File | null> {
    // Convert fetch promise to observable using from()
    return from(
      fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
          const fileName =
            fileKey?.split('/').pop() ?? `attachment_${index + 1}`;
          return new File([blob], fileName, { type: blob.type });
        })
    ).pipe(
      catchError(error => {
        this.logger.error(`Failed to fetch file at index ${index}:`, error);
        return of(null);
      })
    );
  }
}
