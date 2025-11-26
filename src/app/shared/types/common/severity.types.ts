export enum ESeverity {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warn',
  DANGER = 'danger',
  ERROR = 'error',
}

export type EPrimeNGSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast'
  | undefined;

export type EPrimeNGNotificationSeverity = EPrimeNGSeverity | 'error';
