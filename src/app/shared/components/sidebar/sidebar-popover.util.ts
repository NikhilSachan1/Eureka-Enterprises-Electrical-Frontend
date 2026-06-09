/** Popover panels opened from the sidebar footer (user menu, role switcher). */
export const SIDEBAR_FOOTER_POPOVER_CLASS = 'sidebar-footer-popover';

export function isSidebarFooterPopoverOpen(): boolean {
  const popover = document.querySelector(`.${SIDEBAR_FOOTER_POPOVER_CLASS}`);

  if (!popover) {
    return false;
  }

  const rect = popover.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function isPointerInSidebarFooterPopover(
  clientX: number,
  clientY: number
): boolean {
  const popover = document.querySelector(`.${SIDEBAR_FOOTER_POPOVER_CLASS}`);

  if (!popover) {
    return false;
  }

  const { left, right, top, bottom } = popover.getBoundingClientRect();
  return (
    clientX >= left && clientX <= right && clientY >= top && clientY <= bottom
  );
}

export function isNodeInSidebarFooterPopover(
  target: EventTarget | null
): boolean {
  if (!(target instanceof Node)) {
    return false;
  }

  const popover = document.querySelector(`.${SIDEBAR_FOOTER_POPOVER_CLASS}`);
  return Boolean(popover?.contains(target));
}
