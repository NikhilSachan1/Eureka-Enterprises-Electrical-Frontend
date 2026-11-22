/**
 * Shape of a loading placeholder:
 * - line: a text-height bar (table cells, labels)
 * - block: a rectangle (thumbnails, tiles, buttons)
 * - circle: avatars, icon buttons
 * - card: a block with two text lines under it (card / grid views)
 */
export type TSkeletonVariant = 'line' | 'block' | 'circle' | 'card';
