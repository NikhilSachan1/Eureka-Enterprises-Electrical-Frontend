/** A page (route component) that can tell whether leaving it would lose typed input. */
export interface IUnsavedChangesAware {
  hasUnsavedChanges(): boolean;
}

/** A form whose submit is in flight; marked saved when the API write succeeds. */
export interface IPendingSave {
  markSaved(): void;
}
