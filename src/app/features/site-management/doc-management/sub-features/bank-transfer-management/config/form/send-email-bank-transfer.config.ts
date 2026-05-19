import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { FORM_VALIDATION_PATTERNS } from '@shared/constants';
import { editorRequiredValidator } from '@shared/utility/validators.util';
import {
  EDataType,
  EEditorToolbarOption,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ISendEmailBankTransferUIFormDto } from '../../types/bank-transfer.dto';

export const emailChipListValidator = (required: boolean): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const emails = Array.isArray(control.value)
      ? (control.value as string[])
      : [];
    if (required && emails.length === 0) {
      return { required: true };
    }
    if (emails.length === 0) {
      return null;
    }
    const invalid = emails.filter(
      email => !FORM_VALIDATION_PATTERNS.EMAIL.test(email)
    );
    return invalid.length > 0 ? { email: true } : null;
  };
};

const SEND_EMAIL_BANK_TRANSFER_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ISendEmailBankTransferUIFormDto> =
  {
    to: {
      fieldType: EDataType.AUTOCOMPLETE,
      id: 'to',
      fieldName: 'to',
      label: 'To',
      placeholder: 'Type email and press Tab or comma to add',
      autocompleteConfig: {
        multiple: true,
        addOnBlur: true,
        addOnTab: true,
        separator: ',',
        optionLabel: 'label',
        showClearButton: false,
        filterBy: 'label',
      },
      validators: [emailChipListValidator(true)],
    },
    cc: {
      fieldType: EDataType.AUTOCOMPLETE,
      id: 'cc',
      fieldName: 'cc',
      label: 'CC',
      placeholder: 'Optional — Tab or comma to add',
      autocompleteConfig: {
        multiple: true,
        addOnBlur: true,
        addOnTab: true,
        separator: ',',
        optionLabel: 'label',
        showClearButton: false,
        filterBy: 'label',
      },
      validators: [emailChipListValidator(false)],
    },
    subject: {
      fieldType: EDataType.TEXT,
      id: 'subject',
      fieldName: 'subject',
      label: 'Subject',
      validators: [Validators.required],
    },
    body: {
      fieldType: EDataType.EDITOR,
      id: 'body',
      fieldName: 'body',
      label: 'Body',
      placeholder: 'Write your email message here',
      editorConfig: {
        height: '280px',
        toolbarFilter: {
          include: [
            EEditorToolbarOption.HEADER,
            EEditorToolbarOption.FONT,
            EEditorToolbarOption.SIZE,
            EEditorToolbarOption.LIST,
            EEditorToolbarOption.ALIGNMENT,
            EEditorToolbarOption.BOLD,
            EEditorToolbarOption.ITALIC,
            EEditorToolbarOption.LINK,
            EEditorToolbarOption.COLOR,
            EEditorToolbarOption.BACKGROUND,
          ],
        },
      },
      validators: [editorRequiredValidator()],
    },
  };

export const SEND_EMAIL_BANK_TRANSFER_FORM_CONFIG: IFormConfig<ISendEmailBankTransferUIFormDto> =
  {
    fields: SEND_EMAIL_BANK_TRANSFER_FORM_FIELDS_CONFIG,
  };
