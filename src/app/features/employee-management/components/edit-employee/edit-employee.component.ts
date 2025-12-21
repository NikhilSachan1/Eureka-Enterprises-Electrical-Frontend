import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-edit-employee',
  imports: [],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEmployeeComponent {}
