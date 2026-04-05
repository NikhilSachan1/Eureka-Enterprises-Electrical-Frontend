import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-status-summary',
  imports: [],
  templateUrl: './status-summary.component.html',
  styleUrl: './status-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSummaryComponent {}
