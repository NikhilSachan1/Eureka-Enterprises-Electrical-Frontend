/** Where the page is: checking the server, ready to sync, blocked, status call failed, or synced. */
export type TDataSyncViewState =
  | 'loading'
  | 'ready'
  | 'blocked'
  | 'error'
  | 'done';

/** One "what happens" card on the page. */
export interface IDataSyncStep {
  icon: string;
  title: string;
  text: string;
}

/** One figure in the "sync finished" summary. */
export interface IDataSyncResultStat {
  label: string;
  value: string;
}
