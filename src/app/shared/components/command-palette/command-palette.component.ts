import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService } from '@core/services';
import {
  COMMAND_PALETTE_SHORTCUT_KEY,
  COMMAND_PALETTE_TRAIL_SEPARATOR,
  ICONS,
} from '@shared/constants';
import { CommandPaletteService } from '@shared/services/command-palette.service';
import {
  ICommandPaletteEntry,
  ICommandPaletteTextPart,
} from '@shared/types/command-palette/command-palette.interface';
import {
  buildCommandPaletteEntries,
  searchCommandPaletteEntries,
  splitLabelForHighlight,
} from '@shared/utility/command-palette.util';
import { DialogModule } from 'primeng/dialog';

/**
 * Page search (Ctrl/Cmd+K): type to find any page the user can open from the sidebar,
 * move with ↑/↓, open with Enter. Uses the same permission-filtered menu as the sidebar.
 */
@Component({
  selector: 'app-command-palette',
  imports: [DialogModule, FormsModule],
  templateUrl: './command-palette.component.html',
  styleUrl: './command-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteComponent {
  private readonly menuService = inject(MenuService);
  private readonly router = inject(Router);
  protected readonly commandPalette = inject(CommandPaletteService);

  protected readonly ICONS = ICONS;
  protected readonly trailSeparator = COMMAND_PALETTE_TRAIL_SEPARATOR;

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly resultList =
    viewChild<ElementRef<HTMLUListElement>>('resultList');

  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  private readonly entries = computed(() =>
    buildCommandPaletteEntries(
      this.menuService.getMenuSections(),
      (routerLink, parentBasePath) =>
        this.menuService.buildMenuRouterLink(routerLink, parentBasePath),
      (parentBasePath, itemBasePath) =>
        this.menuService.joinMenuBasePath(parentBasePath, itemBasePath)
    )
  );

  protected readonly results = computed(() =>
    searchCommandPaletteEntries(this.entries(), this.query())
  );

  protected readonly activeOptionId = computed(() =>
    this.results().length ? this.optionId(this.activeIndex()) : null
  );

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    const isShortcut =
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === COMMAND_PALETTE_SHORTCUT_KEY;

    // Rich-text editors use Ctrl/Cmd+K for "insert link"; leave it to them.
    const target = event.target as HTMLElement | null;
    if (!isShortcut || target?.isContentEditable) {
      return;
    }

    // Ctrl+K would otherwise move focus to the browser's address/search bar.
    event.preventDefault();
    this.commandPalette.toggle();
  }

  protected onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.commandPalette.close();
    }
  }

  /** Fresh search every time it opens. */
  protected onShow(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.searchInput()?.nativeElement.focus();
  }

  protected onQueryChange(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
    this.resultList()?.nativeElement.scrollTo({ top: 0 });
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const count = this.results().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (count) {
          this.setActive((this.activeIndex() + 1) % count);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) {
          this.setActive((this.activeIndex() - 1 + count) % count);
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const entry = this.results()[this.activeIndex()];
        if (entry) {
          this.open(entry);
        }
        break;
      }
      default:
        break;
    }
  }

  protected setActive(index: number): void {
    this.activeIndex.set(index);
    this.resultList()
      ?.nativeElement.querySelector(`#${this.optionId(index)}`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  /** Mouse follows the keyboard highlight, without scrolling the list under the pointer. */
  protected onOptionHover(index: number): void {
    if (index !== this.activeIndex()) {
      this.activeIndex.set(index);
    }
  }

  protected open(entry: ICommandPaletteEntry): void {
    this.commandPalette.close();
    void this.router.navigateByUrl(entry.route);
  }

  protected labelParts(entry: ICommandPaletteEntry): ICommandPaletteTextPart[] {
    return splitLabelForHighlight(entry.label, this.query());
  }

  protected optionId(index: number): string {
    return `command-palette-option-${index}`;
  }
}
