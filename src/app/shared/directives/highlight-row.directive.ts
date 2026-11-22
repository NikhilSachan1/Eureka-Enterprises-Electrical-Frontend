import { Directive, inject, input } from '@angular/core';
import { TableRowHighlightService } from '@shared/services/table-row-highlight.service';

/**
 * On a link that opens a list, lights that record's row once the list shows it.
 *
 * `<a [routerLink]="…" [appHighlightRow]="doc.id">` — the id must be the row id the target
 * table uses (its `tableUniqueId`). Nothing goes into the URL, so a refresh does not repeat it.
 * For navigation in code, call `TableRowHighlightService.request(id)` before navigating.
 */
@Directive({
  selector: '[appHighlightRow]',
  host: { '(click)': 'onClick()' },
})
export class HighlightRowDirective {
  private readonly rowHighlight = inject(TableRowHighlightService);

  readonly appHighlightRow = input<string | null | undefined>(null);

  protected onClick(): void {
    this.rowHighlight.request(this.appHighlightRow());
  }
}
