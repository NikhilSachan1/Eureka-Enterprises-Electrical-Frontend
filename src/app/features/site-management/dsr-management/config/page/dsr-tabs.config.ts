import { ICONS, ROUTES } from '@shared/constants';
import { ITabItem } from '@shared/types';

const { ENTRIES, PROJECT_WISE } = ROUTES.SITE.PROJECT.DAILY_PROGRESS_TAB;

/** Daily progress (DSR) sub-tabs: the entries, and reporting per project. */
export const DSR_TABS: ITabItem[] = [
  { route: ENTRIES, label: 'Entries', icon: ICONS.COMMON.LIST },
  { route: PROJECT_WISE, label: 'Project wise', icon: ICONS.SITE.BUILDING },
];
