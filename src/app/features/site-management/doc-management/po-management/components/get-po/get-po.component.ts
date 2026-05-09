import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './get-po.component.html',
  styleUrl: './get-po.component.scss',
})
export class GetPoComponent {}
