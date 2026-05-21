import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ICONS } from '@shared/constants/icon.constants';

@Component({
  selector: 'app-section-loader',
  imports: [],
  templateUrl: './section-loader.component.html',
  styleUrl: './section-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionLoaderComponent {
  readonly message = input<string>('Loading...');
  protected readonly icons = ICONS;
}
