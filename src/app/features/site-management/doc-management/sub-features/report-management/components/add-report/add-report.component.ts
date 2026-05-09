import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-add-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './add-report.component.html',
  styleUrl: './add-report.component.scss',
})
export class AddReportComponent {}
