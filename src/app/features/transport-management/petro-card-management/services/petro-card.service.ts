import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IPetroCardAddRequestDto,
  IPetroCardAddResponseDto,
  IPetroCardDeleteRequestDto,
  IPetroCardDeleteResponseDto,
  IPetroCardEditRequestDto,
  IPetroCardEditResponseDto,
  IPetroCardGetRequestDto,
  IPetroCardGetResponseDto,
} from '../types/petro-card.dto';
import { API_ROUTES } from '@core/constants';
import {
  PetroCardAddRequestSchema,
  PetroCardAddResponseSchema,
  PetroCardDeleteRequestSchema,
  PetroCardDeleteResponseSchema,
  PetroCardEditRequestSchema,
  PetroCardEditResponseSchema,
  PetroCardGetRequestSchema,
  PetroCardGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class PetroCardService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addPetroCard(
    formData: IPetroCardAddRequestDto
  ): Observable<IPetroCardAddResponseDto> {
    this.logger.logUserAction('Add Petro Card Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PETRO_CARD.ADD,
        formData,
        PetroCardAddRequestSchema,
        PetroCardAddResponseSchema
      )
      .pipe(
        tap((response: IPetroCardAddResponseDto) => {
          this.logger.logUserAction('Add Petro Card Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Petro Card Error', error);
          } else {
            this.logger.logUserAction('Add Petro Card Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editPetroCard(
    formData: IPetroCardEditRequestDto,
    petroCardId: string
  ): Observable<IPetroCardEditResponseDto> {
    this.logger.logUserAction('Edit Petro Card Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.PETRO_CARD.EDIT(petroCardId),
        formData,
        PetroCardEditRequestSchema,
        PetroCardEditResponseSchema
      )
      .pipe(
        tap((response: IPetroCardEditResponseDto) => {
          this.logger.logUserAction('Edit Petro Card Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Petro Card Error', error);
          } else {
            this.logger.logUserAction('Edit Petro Card Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deletePetroCard(
    formData: IPetroCardDeleteRequestDto
  ): Observable<IPetroCardDeleteResponseDto> {
    this.logger.logUserAction('Delete Petro Card Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.PETRO_CARD.DELETE,
        PetroCardDeleteResponseSchema,
        formData,
        PetroCardDeleteRequestSchema
      )
      .pipe(
        tap((response: IPetroCardDeleteResponseDto) => {
          this.logger.logUserAction('Delete Petro Card Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Petro Card Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Petro Card Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getPetroCardList(
    params?: IPetroCardGetRequestDto
  ): Observable<IPetroCardGetResponseDto> {
    this.logger.logUserAction('Get Petro Card List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PETRO_CARD.LIST,
        PetroCardGetResponseSchema,
        params,
        PetroCardGetRequestSchema
      )
      .pipe(
        tap((response: IPetroCardGetResponseDto) => {
          this.logger.logUserAction('Get Petro Card List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Petro Card List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Petro Card List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
