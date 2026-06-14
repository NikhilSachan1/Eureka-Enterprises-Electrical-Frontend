export type AttendanceRegisterCellTone =
  | 'present'
  | 'absent'
  | 'leave'
  | 'holiday'
  | 'checkedIn'
  | 'checkedOut'
  | 'notCheckedIn'
  | 'pending'
  | 'missing'
  | 'neutral';

export interface IAttendanceRegisterColumn {
  dateKey: string;
  dayLabel: string;
  weekdayLabel: string;
}

export interface IAttendanceRegisterCell {
  code: string;
  tone: AttendanceRegisterCellTone;
  tooltip: string;
}

export interface IAttendanceRegisterRow {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  cells: Record<string, IAttendanceRegisterCell>;
  summary: {
    present: number;
    absent: number;
    leave: number;
    holiday: number;
    missing: number;
    pending: number;
  };
}

export interface IAttendanceRegisterReport {
  columns: IAttendanceRegisterColumn[];
  rows: IAttendanceRegisterRow[];
}
