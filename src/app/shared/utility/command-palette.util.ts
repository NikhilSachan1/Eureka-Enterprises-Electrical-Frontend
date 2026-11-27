import { COMMAND_PALETTE_SCORE } from '@shared/constants/command-palette.constants';
import {
  ICommandPaletteEntry,
  ICommandPaletteTextPart,
} from '@shared/types/command-palette/command-palette.interface';
import {
  TCommandPaletteBuildLink,
  TCommandPaletteJoinBasePath,
} from '@shared/types/command-palette/command-palette.types';
import { MenuItem, MenuSection } from '@shared/types/sidebar/menu.interface';

const normalize = (value: string): string => value.trim().toLowerCase();

function withQueryParams(
  path: string,
  queryParams: Record<string, string> | undefined
): string {
  if (!queryParams || !Object.keys(queryParams).length) {
    return path;
  }
  return `${path}?${new URLSearchParams(queryParams).toString()}`;
}

/**
 * Every page in the (already permission-filtered) sidebar, flattened with its parent
 * names. Links are built the same way the sidebar builds them.
 */
export function buildCommandPaletteEntries(
  sections: MenuSection[],
  buildLink: TCommandPaletteBuildLink,
  joinBasePath: TCommandPaletteJoinBasePath
): ICommandPaletteEntry[] {
  const entries: ICommandPaletteEntry[] = [];
  const seenRoutes = new Set<string>();

  const visit = (
    items: MenuItem[],
    trail: string[],
    parentBasePath: string
  ): void => {
    for (const item of items) {
      if (item.children?.length) {
        visit(
          item.children,
          [...trail, item.label],
          joinBasePath(parentBasePath, item.basePath)
        );
      } else if (item.routerLink) {
        const link = buildLink(item.routerLink, parentBasePath);
        addPage(item, link.startsWith('/') ? link : `/${link}`, trail);
      }
    }
  };

  /** One entry for the page, then one per tab inside it (`searchTabs`, nested). */
  const addPage = (item: MenuItem, path: string, trail: string[]): void => {
    const route = withQueryParams(path, item.queryParams);

    // The same page can sit under two parents; list it once.
    if (!seenRoutes.has(route)) {
      seenRoutes.add(route);
      entries.push({
        id: route,
        label: item.label,
        trail,
        icon: item.icon,
        route,
        searchText: normalize([...trail, item.label].join(' ')),
      });
    }

    item.searchTabs?.forEach(tab =>
      addPage(tab, tab.routerLink ? buildLink(tab.routerLink, path) : path, [
        ...trail,
        item.label,
      ])
    );
  };

  sections.forEach(section => visit(section.items, [], ''));
  return entries;
}

function scoreEntry(entry: ICommandPaletteEntry, query: string): number {
  const label = normalize(entry.label);

  if (label === query) {
    return COMMAND_PALETTE_SCORE.EXACT_LABEL;
  }
  if (label.startsWith(query)) {
    return COMMAND_PALETTE_SCORE.LABEL_STARTS_WITH;
  }
  if (label.split(/\s+/).some(word => word.startsWith(query))) {
    return COMMAND_PALETTE_SCORE.LABEL_WORD_STARTS_WITH;
  }
  if (label.includes(query)) {
    return COMMAND_PALETTE_SCORE.LABEL_CONTAINS;
  }
  return COMMAND_PALETTE_SCORE.TRAIL_ONLY;
}

/**
 * Entries containing every word of the query (in label or parent names), best match
 * first; ties keep menu order. An empty query returns everything in menu order.
 */
export function searchCommandPaletteEntries(
  entries: ICommandPaletteEntry[],
  rawQuery: string
): ICommandPaletteEntry[] {
  const query = normalize(rawQuery);

  if (!query) {
    return entries;
  }

  const words = query.split(/\s+/);

  return entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => words.every(word => entry.searchText.includes(word)))
    .map(({ entry, index }) => ({
      entry,
      index,
      score: scoreEntry(entry, query),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ entry }) => entry);
}

/** Splits a label so the first occurrence of the query can be shown in bold. */
export function splitLabelForHighlight(
  label: string,
  rawQuery: string
): ICommandPaletteTextPart[] {
  const query = normalize(rawQuery);
  const start = query ? label.toLowerCase().indexOf(query) : -1;

  if (start < 0) {
    return [{ text: label, match: false }];
  }

  const end = start + query.length;

  return [
    { text: label.slice(0, start), match: false },
    { text: label.slice(start, end), match: true },
    { text: label.slice(end), match: false },
  ].filter(part => part.text.length > 0);
}
