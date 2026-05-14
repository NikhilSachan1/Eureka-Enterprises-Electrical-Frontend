import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  VendorAddRequestSchema,
  VendorAddResponseSchema,
  VendorChangeStatusRequestSchema,
  VendorChangeStatusResponseSchema,
  VendorDeleteRequestSchema,
  VendorDeleteResponseSchema,
  VendorDetailGetResponseSchema,
  VendorEditRequestSchema,
  VendorEditResponseSchema,
  VendorGetRequestSchema,
  VendorGetResponseSchema,
} from '../schemas';
import {
  IVendorAddFormDto,
  IVendorAddResponseDto,
  IVendorChangeStatusFormDto,
  IVendorChangeStatusResponseDto,
  IVendorDeleteFormDto,
  IVendorDeleteResponseDto,
  IVendorDetailGetFormDto,
  IVendorDetailGetResponseDto,
  IVendorEditFormDto,
  IVendorEditResponseDto,
  IVendorGetFormDto,
  IVendorGetResponseDto,
} from '../types/vendor.dto';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addVendor(formData: IVendorAddFormDto): Observable<IVendorAddResponseDto> {
    this.logger.logUserAction('Add Vendor Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.VENDOR.ADD,
        {
          response: VendorAddResponseSchema,
          request: VendorAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IVendorAddResponseDto) => {
          this.logger.logUserAction('Add Vendor Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Vendor Error', error);
          } else {
            this.logger.logUserAction('Add Vendor Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editVendor(
    formData: IVendorEditFormDto,
    vendorId: string
  ): Observable<IVendorEditResponseDto> {
    this.logger.logUserAction('Edit Vendor Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.VENDOR.EDIT(vendorId),
        {
          response: VendorEditResponseSchema,
          request: VendorEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IVendorEditResponseDto) => {
          this.logger.logUserAction('Edit Vendor Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Vendor Error', error);
          } else {
            this.logger.logUserAction('Edit Vendor Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  changeVendorStatus(
    formData: IVendorChangeStatusFormDto,
    vendorId: string
  ): Observable<IVendorChangeStatusResponseDto> {
    this.logger.logUserAction('Change Vendor Status Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.VENDOR.EDIT(vendorId),
        {
          response: VendorChangeStatusResponseSchema,
          request: VendorChangeStatusRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IVendorChangeStatusResponseDto) => {
          this.logger.logUserAction('Change Vendor Status Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Change Vendor Status Error',
              error
            );
          } else {
            this.logger.logUserAction('Change Vendor Status Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteVendor(
    formData: IVendorDeleteFormDto
  ): Observable<IVendorDeleteResponseDto> {
    this.logger.logUserAction('Delete Vendor Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.VENDOR.DELETE,
        {
          response: VendorDeleteResponseSchema,
          request: VendorDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IVendorDeleteResponseDto) => {
          this.logger.logUserAction('Delete Vendor Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Vendor Error', error);
          } else {
            this.logger.logUserAction('Delete Vendor Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVendorList(params?: IVendorGetFormDto): Observable<IVendorGetResponseDto> {
    this.logger.logUserAction('Get Vendor List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.VENDOR.LIST,
        {
          response: VendorGetResponseSchema,
          request: VendorGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IVendorGetResponseDto) => {
          this.logger.logUserAction('Get Vendor List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Vendor List Error', error);
          } else {
            this.logger.logUserAction('Get Vendor List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVendorDetailById(
    params: IVendorDetailGetFormDto
  ): Observable<IVendorDetailGetResponseDto> {
    this.logger.logUserAction('Get Vendor Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.VENDOR.GET_VENDOR_BY_ID(params.vendorId),
        {
          response: VendorDetailGetResponseSchema,
        },
        params
      )
      .pipe(
        tap((response: IVendorDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vendor Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vendor Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Vendor Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
