import { IInputFieldsConfig } from "../models/input-fields-config.model";
import { EAutocomplete, ECalendarView, ECheckBoxAndRadioAlign, EDateIconDisplay, EDateSelectionMode, EFieldSize, EFileMode, EFloatLabelVariant, EInputNumberMode, EMultiSelectDisplayType, ESpinnerMode, EUpAndDownButtonLayout } from "../types/form-input.types";

export const DEFAULT_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    autocomplete: EAutocomplete.Off,
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    floatLabelVariant: EFloatLabelVariant.On,
};

export const DEFAULT_NUMBER_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    numberConfig: {
        mode: EInputNumberMode.Decimal,
        allowNumberFormatting: true,
        showUpAndDownButtons: true,
        upAndDownButtonLayout: EUpAndDownButtonLayout.Horizontal,
        spinnerMode: ESpinnerMode.Horizontal,
        locale: 'en-IN',
        step: 1,
    }
};

export const DEFAULT_SELECT_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    selectConfig: {
        showCheckmark: true,
        haveFilter: true,
        filterBy: 'value',
        showClearButton: true,
        isEditable: true,
        virtualScroll: true,
        virtualScrollItemSize: 10,
    }
};

export const DEFAULT_MULTI_SELECT_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    multiSelectConfig: {
        haveFilter: true,
        filterBy: 'value',
        showClearButton: true,
        showToggleAll: true,
        selectAll: true,
        display: EMultiSelectDisplayType.Chip,
    }
};

export const DEFAULT_DATE_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    dateConfig: {
        showCalendarIcon: true,
        iconDisplay: EDateIconDisplay.Input,
        timeOnly: false,
        showButtonBar: true,
        selectionMode: EDateSelectionMode.Single,
        numberOfMonths: 1,
        calendarView: ECalendarView.Date,
    }
};

export const DEFAULT_PASSWORD_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    passwordConfig: {
        feedback: true,
        promptLabel: 'Choose a password',
        weakLabel: 'Too simple',
        mediumLabel: 'Average complexity',
        strongLabel: 'Complex password',
        toggleMask: true,
        strongRegex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$',
        mediumRegex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$',
    }
}

export const DEFAULT_CHECKBOX_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    fieldSize: EFieldSize.Large,
    checkboxConfig: {
        binary: true,
        indeterminate: false,
        align: ECheckBoxAndRadioAlign.Horizontal,
    }
}

export const DEFAULT_RADIO_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    fieldSize: EFieldSize.Large,
    radioConfig: {
        align: ECheckBoxAndRadioAlign.Horizontal,
    }
}

export const DEFAULT_FILE_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
    fieldSize: EFieldSize.Large,
    fileConfig: {
        customUpload: true,
        multipleFiles: false,
        maxFileSize: 50000,
        mode: EFileMode.Advanced,
        automaticUpload: false,
        chooseLabel: 'Choose Image',
        cancelLabel: 'Cancel',
        showUploadButton: true,
        showCancelButton: true,
    }
}