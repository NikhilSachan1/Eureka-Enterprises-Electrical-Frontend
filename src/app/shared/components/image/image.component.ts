import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  effect,
} from '@angular/core';
import { Image } from 'primeng/image';

@Component({
  selector: 'app-image',
  imports: [Image],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  mediaUrl = input.required<string>();
  alt = input<string>('');
  preview = input<boolean>(true);
  errorUrl = input<string>('');
  loading = input<'lazy' | 'eager'>('lazy');
  class = input<string>('');

  protected readonly currentImageUrl = signal<string>('');

  constructor() {
    // Update currentImageUrl when mediaUrl changes
    effect(() => {
      this.currentImageUrl.set(this.mediaUrl());
    });
  }

  protected onImageError(): void {
    const fallbackUrl = this.errorUrl();
    if (fallbackUrl) {
      this.currentImageUrl.set(fallbackUrl);
    }
  }
}
