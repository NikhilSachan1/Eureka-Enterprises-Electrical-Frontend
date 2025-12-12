import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { stringToArray } from './string.util';

export const noSpecialCharactersValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (!value) {
      return null;
    }

    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      value
    );
    return hasSpecialChars ? { hasSpecialChars: true } : null;
  };
};

export const fileLimitValidator = (fileLimit: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (!value) {
      return null;
    }

    const fileSize = value.length;
    return fileSize > fileLimit
      ? { fileLimit: true, fileLimitValue: fileLimit }
      : null;
  };
};

export const fileSizeValidator = (maxFileSize: number): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (!value) {
      return null;
    }

    const fileSize = value.reduce(
      (sum: number, file: File) => sum + file.size,
      0
    );
    return fileSize > maxFileSize
      ? { fileSize: true, fileSizeValue: maxFileSize }
      : null;
  };
};

export const fileFormatValidator = (
  allowedFileTypes: string[]
): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const { value } = control;
    if (!value) {
      return null;
    }

    const fileTypes = value.map(
      (file: File) => stringToArray(file.type, '/')[1]
    );
    return fileTypes.some((type: string) => !allowedFileTypes.includes(type))
      ? { fileFormat: true, fileFormatValue: allowedFileTypes }
      : null;
  };
};
