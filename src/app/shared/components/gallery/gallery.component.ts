import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoggerService } from '@core/services';
import { DEFAULT_GALLERY_CONFIG } from '@shared/config/gallery.config';
import { ICONS } from '@shared/constants';
import {
  IGalleryConfig,
  IGalleryData,
  IGalleryInputData,
} from '@shared/models';
import { getMediaTypeFromUrl, getFileExtension } from '@shared/utility';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { ButtonComponent } from '../button/button.component';
import {
  EButtonIconPosition,
  EButtonSeverity,
  EButtonType,
  ETableActionType,
} from '@shared/types';

@Component({
  selector: 'app-gallery',
  imports: [
    CommonModule,
    GalleriaModule,
    DialogModule,
    ImageModule,
    ButtonComponent,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly logger = inject(LoggerService);

  readonly icons = ICONS;
  readonly ALL_BUTTON_SEVERITY = EButtonSeverity;
  readonly ALL_BUTTON_ICON_POSITION = EButtonIconPosition;
  readonly ALL_TABLE_ACTION_TYPE = ETableActionType;
  readonly ALL_BUTTON_TYPE = EButtonType;

  // Button configurations
  readonly fullScreenButtonConfig = {
    id: ETableActionType.VIEW,
    label: 'Full Screen',
    icon: this.icons.COMMON.WINDOW_MAXIMIZE,
  };

  readonly downloadButtonConfig = {
    id: ETableActionType.DOWNLOAD,
    label: 'Download',
    icon: this.icons.COMMON.DOWNLOAD,
  };

  responsiveOptions = [
    { breakpoint: '1600px', numVisible: 6 }, // big desktop
    { breakpoint: '1200px', numVisible: 5 }, // normal desktop
    { breakpoint: '992px', numVisible: 4 }, // tablet landscape
    { breakpoint: '768px', numVisible: 3 }, // tablet portrait
    { breakpoint: '576px', numVisible: 2 }, // large phone
    { breakpoint: '480px', numVisible: 1 }, // small phone
  ];

  media = input<IGalleryInputData[]>([]);
  displayBasic = model<boolean>(false);
  displayPdfFullscreen = signal<boolean>(false);
  currentPdfUrl = signal<SafeResourceUrl | string>('');

  galleryDefaultConfig = signal<IGalleryConfig>(DEFAULT_GALLERY_CONFIG);
  mediaComputed = computed(() => this.addMediaTypeInMedia());

  addMediaTypeInMedia(): IGalleryData[] {
    return this.media().map(item => {
      const mediaType = getMediaTypeFromUrl(item.actualMediaUrl);
      const actualMediaUrl =
        mediaType === 'pdf'
          ? this.sanitizer.bypassSecurityTrustResourceUrl(item.actualMediaUrl)
          : item.actualMediaUrl;

      return {
        ...item,
        actualMediaUrl,
        mediaType,
      };
    });
  }

  onActiveIndexChange(event: number): void {
    this.logger.debug('Active index changed', event);
  }

  onVisibleChange(event: boolean): void {
    this.logger.debug('Visible changed', event);
  }

  openPdfFullscreen(pdfUrl: SafeResourceUrl | string): void {
    this.currentPdfUrl.set(pdfUrl);
    this.displayPdfFullscreen.set(true);
  }

  closePdfFullscreen(): void {
    this.displayPdfFullscreen.set(false);
    this.currentPdfUrl.set('');
  }

  downloadFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getFileIcon(mediaType: string): string {
    return this.icons.MEDIA[
      mediaType.toUpperCase() as keyof typeof this.icons.MEDIA
    ];
  }

  getFileExtension(url: string): string {
    return getFileExtension(url);
  }
}
