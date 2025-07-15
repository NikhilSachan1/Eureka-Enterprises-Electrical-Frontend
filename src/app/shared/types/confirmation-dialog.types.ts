import { EDataTableInputType } from "@shared/types/data-table.types";

export enum EDialogType {
    DEFAULT = 'default',
    DELETE = 'delete',
    APPROVE = 'approve',
    REJECT = 'reject',
    CANCEL = 'cancel',
    ALLOCATE = 'allocate',
    DEALLOCATE = 'deallocate',
}

export enum EDialogPosition {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
    TOP_LEFT = 'topleft',
    TOP_RIGHT = 'topright',
    BOTTOM_LEFT = 'bottomleft',
    BOTTOM_RIGHT = 'bottomright'
}

export enum EConfirmationDialogRecordDetailInputType {
    TEXT = EDataTableInputType.TEXT,
    NUMBER = EDataTableInputType.NUMBER,
    DATE = EDataTableInputType.DATE,
    CURRENCY = EDataTableInputType.CURRENCY,
}