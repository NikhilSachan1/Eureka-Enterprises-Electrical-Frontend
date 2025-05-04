export interface TableColumn {
  field: string;
  header: string;
  filterType?: 'text' | 'date' | 'numeric' | 'boolean' | 'dropdown';
  filterField?: string;
  filterMatchMode?: string;
  filterOptions?: any[];
  bodyTemplate?: string;
  secondaryField?: string;
  labelPrimary?: string;
  labelSecondary?: string;
  sortable?: boolean;
} 