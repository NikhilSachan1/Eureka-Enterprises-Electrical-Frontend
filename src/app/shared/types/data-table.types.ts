import { EInputType } from "./data-table-input.types";

export enum EBulkActionType {
  SET_INACTIVE = 'setInactive',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export enum ERowActionType {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  REGULARIZE = 'regularize',
}

export enum ETableBodyTemplate {
    TEXT = 'text',
    TEXT_WITH_SUBTITLE_AND_IMAGE = 'textWithSubtitleAndImage',
    STATUS = 'status',
    DATE = 'date',
}

export enum ETableDataType {
    TEXT = EInputType.TEXT,
    NUMBER = EInputType.NUMBER,
    DATE = EInputType.DATE,
    BOOLEAN = EInputType.BOOLEAN,
}

export enum ETableSearchInputType {
    TEXT = EInputType.TEXT,
    DROPDOWN = EInputType.DROPDOWN,
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





