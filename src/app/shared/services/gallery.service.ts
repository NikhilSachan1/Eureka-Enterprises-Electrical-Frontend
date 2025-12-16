import { Injectable, signal, WritableSignal } from '@angular/core';
import { IGalleryInputData } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  visible: WritableSignal<boolean> = signal(false);
  media = signal<IGalleryInputData[]>([]);

  show(mediaData: IGalleryInputData[]): void {
    this.media.set(mediaData);
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
    this.media.set([]);
  }
}
