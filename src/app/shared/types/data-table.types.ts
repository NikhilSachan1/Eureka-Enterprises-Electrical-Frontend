export enum EDataTableInputType {
    TEXT = 'text',
    NUMBER = 'number',
    DATE = 'date',
    BOOLEAN = 'boolean',
    DROPDOWN = 'dropdown',
    CURRENCY = 'currency',
}

export enum EBulkActionType {
  SET_INACTIVE = 'setInactive',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  ALLOCATE = 'allocate',
  DEALLOCATE = 'deallocate',
}

export enum ERowActionType {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  REGULARIZE = 'regularize',
  ALLOCATE = 'allocate',
  DEALLOCATE = 'deallocate',
}

export enum ETableBodyTemplate {
    TEXT = 'text',
    TEXT_WITH_SUBTITLE_AND_IMAGE = 'textWithSubtitleAndImage',
    STATUS = 'status',
    DATE = 'date',
    CURRENCY = 'currency',
    FILE_LINK = 'fileLink',
    BULLET_POINTS = 'bulletPoints',
}

export enum ETableDataType {
    TEXT = EDataTableInputType.TEXT,
    NUMBER = EDataTableInputType.NUMBER,
    DATE = EDataTableInputType.DATE,
    BOOLEAN = EDataTableInputType.BOOLEAN,
}

export enum ETableSearchInputType {
    TEXT = EDataTableInputType.TEXT,
    DROPDOWN = EDataTableInputType.DROPDOWN,
}

export enum ETableFilterDisplayType {
    MENU = 'menu',
    CHIP = 'chip',
}   

export enum ETableFilterOperator {
    AND = 'and',
    OR = 'or',
}           

export enum ETableFilterMatchMode {
    EQUALS = 'equals',                      
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
    ENDS_WITH = 'endsWith',
    IN = 'in',
    ANY = 'any',
}