/** Shape of a loading placeholder (`<app-skeleton [variant]="…" />`). */
export enum ESkeletonVariant {
  /** A text-height bar (table cells, labels). The default. */
  LINE = 'line',
  /** A rectangle (thumbnails, tiles, buttons). */
  BLOCK = 'block',
  /** Avatars, icon buttons. */
  CIRCLE = 'circle',
  /** A block with two text lines under it (card / grid views). */
  CARD = 'card',
}
