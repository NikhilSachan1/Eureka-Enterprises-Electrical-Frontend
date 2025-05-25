import { EDialogPosition } from "../types/confirmation-dialog.types";

export interface IConfirmationDialogConfig {
    header: string;
    icon: string;
    message: string;
    closeOnEscape: boolean;
    dismissableMask: boolean;
    closable: boolean;
    position: EDialogPosition;
    blockScroll: boolean;
    styleClass: string;
    acceptButtonProps: IConfirmationDialogButtonProps;
    rejectButtonProps: IConfirmationDialogButtonProps;
    inputProps: IConfirmationDialogInputProps[];
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

export interface IConfirmationDialogInputProps {
    label: string;
    type: string;
    placeholder: string;
}