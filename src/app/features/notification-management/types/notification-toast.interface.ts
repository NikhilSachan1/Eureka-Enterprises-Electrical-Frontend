/** What the new-notification toast shows and where a click takes the user. */
export interface INotificationToastData {
  /** First line: the notification title, or "3 new notifications". */
  heading: string;
  /** Second line: the notification message, or the latest title when several arrived. */
  detail: string | null;
  /** How many arrived since the user last looked. */
  count: number;
  /** Set for a single notification: clicking marks it read. */
  notificationId: string | null;
  /** Set for a single notification with a page: clicking goes straight there. */
  route: string | null;
  /** Record the page should highlight once it opens (e.g. the expense row). */
  referenceId: string | null;
}
