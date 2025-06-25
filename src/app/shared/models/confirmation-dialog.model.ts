import { EConfirmationDialogRecordDetailInputType, EDialogPosition } from "../types";
import { IInputFieldsConfig } from "./input-fields-config.model";

export interface IConfirmationDialogConfig {
    header: string;
    icon: string;
    iconBackgroundColor?: string;
    iconTextColor?: string;
    iconContainerClass?: string;
    message: string;
    closeOnEscape: boolean;
    dismissableMask: boolean;
    closable: boolean;
    position: EDialogPosition;
    blockScroll: boolean;
    styleClass: string;
    acceptButtonProps: Partial<IConfirmationDialogButtonProps>;
    rejectButtonProps: Partial<IConfirmationDialogButtonProps>;
    inputFieldConfigs?: Partial<IInputFieldsConfig>[];
    recordDetails?: {
        title?: string;
        details: Array<{
            label: string;
            value: string | number | Date;
            type?: EConfirmationDialogRecordDetailInputType;
        }>;
    };
    accept?: () => void;
    reject?: () => void;
}

export interface IConfirmationDialogButtonProps {
    label: string;
    icon: string;
    outlined: boolean;
    visible: boolean;
    styleClass: string;
}

export interface IConfirmationDialogOutput {
    confirmed: boolean;
    formData?: any;
}