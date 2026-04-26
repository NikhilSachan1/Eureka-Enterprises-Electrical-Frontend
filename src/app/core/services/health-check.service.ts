import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '@core/constants';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class HealthCheckService {
  private readonly http = inject(HttpClient);
  private readonly environmentService = inject(EnvironmentService);

  check(): Observable<boolean> {
    return this.http
      .get<unknown>(
        `${this.environmentService.apiBaseUrl}/${API_ROUTES.HEALTH.CHECK}`
      )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
