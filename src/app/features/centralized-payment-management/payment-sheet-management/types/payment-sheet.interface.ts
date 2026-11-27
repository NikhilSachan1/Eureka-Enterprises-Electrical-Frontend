import { Signal } from '@angular/core';
import { EPaymentRecordMode } from './payment-sheet.enum';
import { IPaymentSheetGetBaseResponseDto } from './payment-sheet.dto';

export interface IPaymentSheet extends IPaymentSheetGetBaseResponseDto {
  statusLabel?: string;
  originalRawData: IPaymentSheetGetBaseResponseDto;
}

export interface IPaymentSheetWorkflowRow {
  status?: string;
  currentStage?: string | null;
}

/** Record-mode state a Reimburse / Bank Transfer form binds to (driven by `payments.record_modes`). */
export interface IPaymentRecordModeState {
  /** More than one mode allowed: show the "Record Payment" dropdown. */
  showSelect: Signal<boolean>;
  /** What the form starts with and returns to on reset. */
  defaultMode: Signal<EPaymentRecordMode>;
  /** The mode currently selected (or forced by config). */
  current: Signal<EPaymentRecordMode>;
}
