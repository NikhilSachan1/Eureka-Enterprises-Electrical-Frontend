/** Builds a page's link from its routerLink and inherited base path (MenuService). */
export type TCommandPaletteBuildLink = (
  routerLink: string,
  parentBasePath: string
) => string;

/** Joins a parent's base path with an item's own basePath (MenuService). */
export type TCommandPaletteJoinBasePath = (
  parentBasePath: string,
  itemBasePath?: string
) => string;
