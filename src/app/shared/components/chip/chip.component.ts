import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Chip } from 'primeng/chip';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chip',
  imports: [Chip, NgClass],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  label = input.required<string>();
  icon = input<string>();
  styleClass = input<string>();
}
