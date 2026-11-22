/** One page the user can jump to from page search (a sidebar leaf they are allowed to see). */
export interface ICommandPaletteEntry {
  /** Stable key for lists: the full route. */
  id: string;
  label: string;
  /** Parent menu labels, e.g. ['Transport', 'Vehicles'] for "Vehicle List". */
  trail: string[];
  icon?: string;
  /** Absolute URL to navigate to. */
  route: string;
  /** Lower-cased label + trail, matched against the query. */
  searchText: string;
}

/** A piece of a label, so the part that matches the query can be bolded. */
export interface ICommandPaletteTextPart {
  text: string;
  match: boolean;
}
