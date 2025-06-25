import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { INotificationOptions } from '../models';
import { EPrimeNGNotificationSeverity, ESeverity } from '../types';
import { 
  DEFAULT_NOTIFICATION_OPTIONS_CONFIG, 
  DEFAULT_NOTIFICATION_MESSAGES, 
  DEFAULT_NOTIFICATION_TITLES 
} from '../config';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  
  private readonly messageService = inject(MessageService);

  // General methods for flexibility
  success(message: string, title: string = DEFAULT_NOTIFICATION_TITLES.success, options?: INotificationOptions): void {
    this.showNotification(ESeverity.SUCCESS, message, title, options);
  }

  error(message: string, title: string = DEFAULT_NOTIFICATION_TITLES.error, options?: INotificationOptions): void {
    this.showNotification(ESeverity.ERROR, message, title, options);
  }

  warning(message: string, title: string = DEFAULT_NOTIFICATION_TITLES.warning, options?: INotificationOptions): void {
    this.showNotification(ESeverity.WARNING, message, title, options);
  }

  info(message: string, title: string = DEFAULT_NOTIFICATION_TITLES.info, options?: INotificationOptions): void {
    this.showNotification(ESeverity.INFO, message, title, options);
  }

  // Specific methods for common use cases - just pass the message!
  
  validationError(message: string): void {    
    this.showNotification(
      ESeverity.ERROR, 
      message || DEFAULT_NOTIFICATION_MESSAGES.VALIDATION_FAILED, 
      DEFAULT_NOTIFICATION_TITLES.validation,
    );
  }
 
  private showNotification(
    severity: EPrimeNGNotificationSeverity, 
    message: string, 
    title: string, 
    options?: INotificationOptions
  ): void {
    
    const finalOptions = {
      ...DEFAULT_NOTIFICATION_OPTIONS_CONFIG,
      ...options
    };

    this.messageService.add({
      severity,
      summary: title,
      detail: message,
      life: finalOptions.life,
      sticky: finalOptions.sticky,
      closable: finalOptions.closable,
    });
  }
} 