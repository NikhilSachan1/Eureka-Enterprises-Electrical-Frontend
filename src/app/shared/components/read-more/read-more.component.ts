import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DEFAULT_READ_MORE_CONFIG } from '@shared/config';
import { IReadMoreConfig } from '@shared/types';
import { InplaceModule } from 'primeng/inplace';

@Component({
  selector: 'app-read-more',
  imports: [InplaceModule],
  templateUrl: './read-more.component.html',
  styleUrl: './read-more.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadMoreComponent {
  readMoreConfig = input<Partial<IReadMoreConfig>>(DEFAULT_READ_MORE_CONFIG);
  text = input<string>();

  protected readonly shouldTruncate = computed(
    () => (this.text()?.length ?? 0) > (this.readMoreConfig().maxLength ?? 0)
  );
  protected readonly truncatedText = computed(
    () => this.text()?.substring(0, this.readMoreConfig().maxLength ?? 0) ?? ''
  );
  protected readonly readMoreText = computed(
    () => this.readMoreConfig().readMoreText
  );
  protected readonly readLessText = computed(
    () => this.readMoreConfig().readLessText
  );
}
