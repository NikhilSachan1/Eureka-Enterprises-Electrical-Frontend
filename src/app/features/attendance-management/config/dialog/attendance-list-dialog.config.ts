import { IConfirmationDialogConfig } from '../../../../shared/models/confirmation-dialog.model';
import { REGULARIZE_ATTENDANCE_FORM_CONFIG } from '../../config/form/dialog-form.config';

export const REGULARIZE_ATTENDANCE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> =
{
    header: 'Regularize Attendance',
    message: 'Are you sure you want to regularize this attendance?',
    icon: 'pi pi-clock',
    iconContainerClass: 'bg-primary text-primary-contrast',
    inputFieldConfigs: REGULARIZE_ATTENDANCE_FORM_CONFIG,
};
