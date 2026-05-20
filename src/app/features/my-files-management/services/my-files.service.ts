import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import {
  MyFilesBreadcrumbResponseSchema,
  MyFilesCreateFolderRequestSchema,
  MyFilesCreateFolderResponseSchema,
  MyFilesListRequestSchema,
  MyFilesListResponseSchema,
  MyFilesRenameRequestSchema,
  MyFilesRenameResponseSchema,
} from '../schemas';
import {
  IMyFilesBreadcrumbResponseDto,
  IMyFilesCreateFolderFormDto,
  IMyFilesCreateFolderResponseDto,
  IMyFilesListFormDto,
  IMyFilesListResponseDto,
  IMyFilesRenameFormDto,
  IMyFilesRenameResponseDto,
} from '../types/my-files.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyFilesService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getMyFilesList(
    params?: IMyFilesListFormDto
  ): Observable<IMyFilesListResponseDto> {
    this.logger.logUserAction('Get My Files List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.MY_FILES.LIST,
        {
          response: MyFilesListResponseSchema,
          request: MyFilesListRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IMyFilesListResponseDto) => {
          this.logger.logUserAction('Get My Files List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get My Files List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get My Files List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getMyFilesBreadcrumb(
    folderId: string
  ): Observable<IMyFilesBreadcrumbResponseDto> {
    this.logger.logUserAction('Get My Files Breadcrumb Request');

    return this.apiService
      .getValidated(API_ROUTES.MY_FILES.BREADCRUMBS(folderId), {
        response: MyFilesBreadcrumbResponseSchema,
      })
      .pipe(
        tap((response: IMyFilesBreadcrumbResponseDto) => {
          this.logger.logUserAction(
            'Get My Files Breadcrumb Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get My Files Breadcrumb Error',
              error
            );
          } else {
            this.logger.logUserAction('Get My Files Breadcrumb Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  renameMyFile(
    fileId: string,
    formData: IMyFilesRenameFormDto
  ): Observable<IMyFilesRenameResponseDto> {
    this.logger.logUserAction('Rename My File Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.MY_FILES.RENAME(fileId),
        {
          response: MyFilesRenameResponseSchema,
          request: MyFilesRenameRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IMyFilesRenameResponseDto) => {
          this.logger.logUserAction('Rename My File Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Rename My File Error', error);
          } else {
            this.logger.logUserAction('Rename My File Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  createMyFileFolder(
    formData: IMyFilesCreateFolderFormDto
  ): Observable<IMyFilesCreateFolderResponseDto> {
    this.logger.logUserAction('Create My File Folder Request');

    return this.apiService
      .postValidated(
        API_ROUTES.MY_FILES.CREATE_FOLDER,
        {
          response: MyFilesCreateFolderResponseSchema,
          request: MyFilesCreateFolderRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IMyFilesCreateFolderResponseDto) => {
          this.logger.logUserAction('Create My File Folder Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Create My File Folder Error',
              error
            );
          } else {
            this.logger.logUserAction('Create My File Folder Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
