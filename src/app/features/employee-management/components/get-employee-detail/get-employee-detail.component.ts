import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-employee-detail',
  imports: [],
  templateUrl: './get-employee-detail.component.html',
  styleUrl: './get-employee-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetEmployeeDetailComponent {}
