import { Injectable, signal } from '@angular/core';
import { IGalleryInputData } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  media = signal<IGalleryInputData[]>([]);

  show(mediaData: IGalleryInputData[]): void {
    this.media.set(mediaData);
  }

  hide(): void {
    this.media.set([]);
  }
}
