import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-edit-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './edit-po.component.html',
  styleUrl: './edit-po.component.scss',
})
export class EditPoComponent {}
