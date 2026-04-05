import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatusSummaryComponent } from '../status-summary/status-summary.component';

@Component({
  selector: 'app-main-dashboard',
  imports: [StatusSummaryComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainDashboardComponent {}
