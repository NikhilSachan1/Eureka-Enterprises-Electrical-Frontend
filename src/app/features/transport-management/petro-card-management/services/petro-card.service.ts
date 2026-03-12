import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
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
  private readonly apiService = inject(ApiService);

  addPetroCard(
    formData: IPetroCardAddFormDto
  ): Observable<IPetroCardAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.PETRO_CARD.ADD,
        {
          response: PetroCardAddResponseSchema,
          request: PetroCardAddRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editPetroCard(
    formData: IPetroCardEditFormDto,
    petroCardId: string
  ): Observable<IPetroCardEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.PETRO_CARD.EDIT(petroCardId),
        {
          response: PetroCardEditResponseSchema,
          request: PetroCardEditRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deletePetroCard(
    formData: IPetroCardDeleteFormDto
  ): Observable<IPetroCardDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.PETRO_CARD.DELETE,
        {
          response: PetroCardDeleteResponseSchema,
          request: PetroCardDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getPetroCardList(
    params?: IPetroCardGetFormDto
  ): Observable<IPetroCardGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.PETRO_CARD.LIST,
        {
          response: PetroCardGetResponseSchema,
          request: PetroCardGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  linkPetroCard(
    formData: IPetroCardLinkFormDto
  ): Observable<IPetroCardLinkResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.PETRO_CARD.LINK,
        {
          response: PetroCardLinkResponseSchema,
          request: PetroCardLinkRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
