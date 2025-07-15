import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noSpecialCharactersValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      value,
    );
    return hasSpecialChars ? { hasSpecialChars: true } : null;
  };
}; 