import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-employee',
  imports: [],
  templateUrl: './get-employee.component.html',
  styleUrl: './get-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetEmployeeComponent {}
