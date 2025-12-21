import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-delete-employee',
  imports: [],
  templateUrl: './delete-employee.component.html',
  styleUrl: './delete-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteEmployeeComponent {}
