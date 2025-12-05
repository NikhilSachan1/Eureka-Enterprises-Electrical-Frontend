import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Chip } from 'primeng/chip';

@Component({
  selector: 'app-chip',
  imports: [Chip],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  label = input.required<string>();
  icon = input<string>();
  styleClass = input<string>();
}
