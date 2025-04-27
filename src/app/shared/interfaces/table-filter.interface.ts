export interface TableFilter {
  field: string;
  options: any[];
  selected: any;
  placeholder: string;
  showTags?: boolean;
  matchMode?: string;
  getSeverity?: (value: any) => 'success' | 'warn' | 'info' | 'danger';
} 