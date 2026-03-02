import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IPetroCardAddFormDto,
  IPetroCardAddResponseDto,
  IPetroCardDeleteFormDto,
  IPetroCardDeleteResponseDto,
  IPetroCardEditFormDto,
  IPetroCardEditResponseDto,
  IPetroCardGetFormDto,
  IPetroCardGetResponseDto,
  IPetroCardLinkFormDto,
  IPetroCardLinkResponseDto,
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
  PetroCardLinkRequestSchema,
  PetroCardLinkResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class PetroCardService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addPetroCard(
    formData: IPetroCardAddFormDto
  ): Observable<IPetroCardAddResponseDto> {
    this.logger.logUserAction('Add Petro Card Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PETRO_CARD.ADD,
        {
          response: PetroCardAddResponseSchema,
          request: PetroCardAddRequestSchema,
        },
        formData
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
    formData: IPetroCardEditFormDto,
    petroCardId: string
  ): Observable<IPetroCardEditResponseDto> {
    this.logger.logUserAction('Edit Petro Card Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.PETRO_CARD.EDIT(petroCardId),
        {
          response: PetroCardEditResponseSchema,
          request: PetroCardEditRequestSchema,
        },
        formData
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
    formData: IPetroCardDeleteFormDto
  ): Observable<IPetroCardDeleteResponseDto> {
    this.logger.logUserAction('Delete Petro Card Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.PETRO_CARD.DELETE,
        {
          response: PetroCardDeleteResponseSchema,
          request: PetroCardDeleteRequestSchema,
        },
        formData
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
    params?: IPetroCardGetFormDto
  ): Observable<IPetroCardGetResponseDto> {
    this.logger.logUserAction('Get Petro Card List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PETRO_CARD.LIST,
        {
          response: PetroCardGetResponseSchema,
          request: PetroCardGetRequestSchema,
        },
        params
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

  linkPetroCard(
    formData: IPetroCardLinkFormDto
  ): Observable<IPetroCardLinkResponseDto> {
    this.logger.logUserAction('Link Petro Card Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PETRO_CARD.LINK,
        {
          response: PetroCardLinkResponseSchema,
          request: PetroCardLinkRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IPetroCardLinkResponseDto) => {
          this.logger.logUserAction('Link Petro Card Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Link Petro Card Error', error);
          } else {
            this.logger.logUserAction('Link Petro Card Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
