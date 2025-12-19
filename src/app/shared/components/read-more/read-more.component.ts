import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { DEFAULT_READ_MORE_CONFIG } from '@shared/config';
import { IButtonConfig, IReadMoreConfig } from '@shared/types';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-read-more',
  imports: [ButtonComponent],
  templateUrl: './read-more.component.html',
  styleUrl: './read-more.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadMoreComponent {
  readMoreConfig = input<Partial<IReadMoreConfig>>(DEFAULT_READ_MORE_CONFIG);
  text = input<string>();

  private readonly expandedState = signal<boolean>(false);

  protected isExpandedState(): boolean {
    return this.expandedState();
  }

  protected toggleExpanded(): void {
    this.expandedState.set(!this.expandedState());
  }

  protected getReadMoreButtonConfig(): Partial<IButtonConfig> {
    return {
      label: this.readMoreConfig()?.readMoreText,
      link: true,
    };
  }

  protected getReadLessButtonConfig(): Partial<IButtonConfig> {
    return {
      label: this.readMoreConfig()?.readLessText,
      link: true,
    };
  }
}
