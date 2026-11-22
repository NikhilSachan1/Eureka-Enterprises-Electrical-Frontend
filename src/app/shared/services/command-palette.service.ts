import { Injectable, signal } from '@angular/core';

/** Open/closed state of page search, shared by the Ctrl+K shortcut and the sidebar button. */
@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly _visible = signal(false);
  readonly visible = this._visible.asReadonly();

  private readonly isApple = /mac|iphone|ipad/i.test(navigator.userAgent);

  /** "⌘K" on Mac, "Ctrl K" elsewhere: shown on the sidebar button and in the dialog. */
  readonly shortcutLabel = this.isApple ? '⌘K' : 'Ctrl K';

  /** Same shortcut in `aria-keyshortcuts` syntax, read out by screen readers. */
  readonly ariaKeyShortcuts = this.isApple ? 'Meta+K' : 'Control+K';

  open(): void {
    this._visible.set(true);
  }

  close(): void {
    this._visible.set(false);
  }

  toggle(): void {
    this._visible.update(visible => !visible);
  }
}
