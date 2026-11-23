export interface INotificationOptions {
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

/** An API error toast waiting a moment, so the caller's message for it can become its title. */
export interface IPendingApiErrorToast {
  reason: string;
  timer: ReturnType<typeof setTimeout>;
}
