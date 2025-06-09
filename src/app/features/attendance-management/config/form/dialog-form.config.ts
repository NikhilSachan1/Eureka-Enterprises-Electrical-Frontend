import { Validators } from "@angular/forms";
import { EFieldType } from "../../../../shared/types";
import { IInputFieldsConfig } from "../../../../shared/models/input-fields-config.model";

export const REGULARIZE_ATTENDANCE_FORM_CONFIG: Partial<IInputFieldsConfig>[] = [
    {
        fieldType: EFieldType.Select,
        fieldName: 'attendanceStatus',
        label: 'Attendance Status',
        selectConfig: {
            optionsDropdown: [
                { key: 'present', value: 'Present' },
                { key: 'absent', value: 'Absent' },
                { key: 'onLeave', value: 'On Leave' },
                { key: 'holiday', value: 'Holiday' },
                { key: 'checkedIn', value: 'Checked In' },
            ],
        },
        validators: [Validators.required],
    },
    {
        fieldType: EFieldType.TextArea,
        fieldName: 'comment',
        label: 'Comment (Required)',
        validators: [Validators.required, Validators.minLength(10)],
    },
]