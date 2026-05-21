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
  MyFilesUploadRequestSchema,
  MyFilesUploadResponseSchema,
  MyFilesDeleteResponseSchema,
  MyFilesMoveRequestSchema,
  MyFilesMoveResponseSchema,
} from '../schemas';
import {
  IMyFilesBreadcrumbResponseDto,
  IMyFilesCreateFolderFormDto,
  IMyFilesCreateFolderResponseDto,
  IMyFilesDeleteResponseDto,
  IMyFilesListFormDto,
  IMyFilesListResponseDto,
  IMyFilesRenameFormDto,
  IMyFilesRenameResponseDto,
  IMyFilesUploadFormDto,
  IMyFilesUploadResponseDto,
  IMyFilesMoveFormDto,
  IMyFilesMoveResponseDto,
} from '../types/my-files.dto';
import { IMyFilesMoveFolderTreeItem } from '../types/my-files.interface';
import { EMyFileType } from '../types/my-files.enum';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

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

  uploadMyFile(
    formData: IMyFilesUploadFormDto
  ): Observable<IMyFilesUploadResponseDto> {
    this.logger.logUserAction('Upload My File Request');

    return this.apiService
      .postValidated(
        API_ROUTES.MY_FILES.UPLOAD,
        {
          response: MyFilesUploadResponseSchema,
          request: MyFilesUploadRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IMyFilesUploadResponseDto) => {
          this.logger.logUserAction('Upload My File Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Upload My File Error', error);
          } else {
            this.logger.logUserAction('Upload My File Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteMyFile(fileId: string): Observable<IMyFilesDeleteResponseDto> {
    this.logger.logUserAction('Delete My File Request');

    return this.apiService
      .deleteValidated(API_ROUTES.MY_FILES.DELETE(fileId), {
        response: MyFilesDeleteResponseSchema,
      })
      .pipe(
        tap((response: IMyFilesDeleteResponseDto) => {
          this.logger.logUserAction('Delete My File Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete My File Error', error);
          } else {
            this.logger.logUserAction('Delete My File Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  moveMyFile(
    fileId: string,
    formData: IMyFilesMoveFormDto
  ): Observable<IMyFilesMoveResponseDto> {
    this.logger.logUserAction('Move My File Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.MY_FILES.MOVE(fileId),
        {
          response: MyFilesMoveResponseSchema,
          request: MyFilesMoveRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IMyFilesMoveResponseDto) => {
          this.logger.logUserAction('Move My File Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Move My File Error', error);
          } else {
            this.logger.logUserAction('Move My File Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getMoveFolderTreeItems(
    parentId: string | null,
    excludeFolderId?: string,
    search?: string
  ): Observable<IMyFilesMoveFolderTreeItem[]> {
    return this.getMyFilesList({
      parentId,
      ...(search ? { search } : {}),
    }).pipe(
      map(response =>
        response.records
          .filter(
            record =>
              record.type === EMyFileType.FOLDER &&
              record.id !== excludeFolderId
          )
          .map(folder => ({
            id: folder.id,
            name: folder.name,
          }))
      )
    );
  }
}
