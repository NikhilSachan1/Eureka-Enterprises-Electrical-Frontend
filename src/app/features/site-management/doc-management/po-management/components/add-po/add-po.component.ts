import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-add-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './add-po.component.html',
  styleUrl: './add-po.component.scss',
})
export class AddPoComponent {}
