import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { IUserGetRequestDto, IUserGetResponseDto } from '../types/user.dto';
import { API_ROUTES } from '@core/constants';
import { UserGetRequestSchema, UserGetResponseSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getUserList(params?: IUserGetRequestDto): Observable<IUserGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.USER.LIST,
        UserGetResponseSchema,
        params ?? {},
        UserGetRequestSchema
      )
      .pipe(
        tap((response: IUserGetResponseDto) => {
          this.logger.logUserAction('Get User List Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Role Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Role Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
