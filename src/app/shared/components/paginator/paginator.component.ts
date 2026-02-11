import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [PaginatorModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  private readonly config = APP_CONFIG.TABLE_PAGINATION_CONFIG;

  rows = input<number>(this.config.DEFAULT_PAGE_SIZE);
  rowsPerPageOptions = input<number[]>(this.config.DEFAULT_PAGE_SIZE_OPTIONS);
  totalRecords = input<number>(0);
  first = input<number>(0);

  pageChange = output<PaginatorState>();

  protected get currentPageReportTemplate(): string {
    return this.config.CURRENT_PAGE_REPORT_TEMPLATE;
  }
}
