/**
 * Interface for user option menu items
 * Used for sidebar user profile dropdown menu options
 */
export interface UserOption {
  /**
   * Unique identifier for the option
   */
  id: string;
  
  /**
   * Display text for the option
   */
  label: string;
  
  /**
   * PrimeNG icon class
   */
  icon: string;
  
  /**
   * Optional navigation path
   */
  path?: string;
  
  /**
   * Optional variant type to apply specific styling
   */
  variant?: 'default' | 'theme' | 'danger';
} 