import { inject, Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiService, LoggerService } from '@core/services';
import { API_ROUTES } from '@core/constants';

export interface IMailSendPayload {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  attachments: File[];
}

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private readonly apiService = inject(ApiService);
  private readonly logger = inject(LoggerService);

  sendMail(payload: IMailSendPayload): Observable<{ message: string }> {
    this.logger.logUserAction('Send Mail Request', {
      to: payload.to,
      subject: payload.subject,
    });

    const formData = new FormData();
    payload.to.forEach(email => formData.append('to[]', email));
    payload.cc.forEach(email => formData.append('cc[]', email));
    formData.append('subject', payload.subject);
    formData.append('body', payload.body);
    payload.attachments.forEach(file =>
      formData.append('attachments', file, file.name)
    );

    return this.apiService
      .post<{ message: string }>(API_ROUTES.SITE.DOC.SEND_MAIL, formData)
      .pipe(
        tap(response => {
          this.logger.logUserAction('Send Mail Response', response);
        }),
        catchError(error => {
          this.logger.logUserAction('Send Mail Error', error);
          return throwError(() => error);
        })
      );
  }
}
