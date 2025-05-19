export interface ConfirmationOptions {
  header: string;
  message: string;
  icon: string;
  acceptLabel: string;
  rejectLabel: string;
  acceptButtonStyleClass: string;
  rejectButtonStyleClass: string;
  // Additional PrimeNG configuration options
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  acceptIcon?: string;
  rejectIcon?: string;
  acceptVisible?: boolean;
  rejectVisible?: boolean;
  blockScroll?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  defaultFocus?: string;
  acceptButtonProps?: {
    label?: string;
    icon?: string;
    outlined?: boolean;
    size?: string;
  };
  rejectButtonProps?: {
    label?: string;
    icon?: string;
    outlined?: boolean;
    size?: string;
  };
} 