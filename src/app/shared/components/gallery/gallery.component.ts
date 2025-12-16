import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoggerService } from '@core/services';
import { DEFAULT_GALLERY_CONFIG } from '@shared/config/gallery.config';
import { ICONS } from '@shared/constants';
import {
  IGalleryConfig,
  IGalleryInputData,
  EButtonIconPosition,
  EButtonSeverity,
  EButtonType,
  EButtonActionType,
  IAttachmentsGetResponseDto,
  IGalleryResolvedItem,
} from '@shared/types';
import { getMediaTypeFromUrl, getFileExtension } from '@shared/utility';
import { GalleriaModule } from 'primeng/galleria';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { ButtonComponent } from '../button/button.component';
import { AttachmentsService, LoadingService } from '@shared/services';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly icons = ICONS;
  readonly ALL_BUTTON_SEVERITY = EButtonSeverity;
  readonly ALL_BUTTON_ICON_POSITION = EButtonIconPosition;
  readonly ALL_BUTTON_ACTION_TYPE = EButtonActionType;
  readonly ALL_BUTTON_TYPE = EButtonType;

  // Button configurations
  readonly fullScreenButtonConfig = {
    id: EButtonActionType.VIEW,
    label: 'Full Screen',
    icon: this.icons.COMMON.WINDOW_MAXIMIZE,
  };

  readonly downloadButtonConfig = {
    id: EButtonActionType.DOWNLOAD,
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

  media = input<Partial<IGalleryInputData>[]>([]);
  displayBasic = model<boolean>(false);
  displayPdfFullscreen = signal<boolean>(false);
  currentPdfUrl = signal<string | null>(null);
  activeIndex = signal<number>(0);

  galleryDefaultConfig = signal<IGalleryConfig>(DEFAULT_GALLERY_CONFIG);
  resolvedMedia = signal<IGalleryResolvedItem[]>([]);

  readonly closed = output<void>();

  private readonly mediaEffect = effect(() => {
    const mediaItems = this.media() as IGalleryInputData[];
    this.activeIndex.set(0);

    if (!mediaItems || mediaItems.length === 0) {
      this.resolvedMedia.set([]);
      this.displayBasic.set(false);
      return;
    }

    this.resolveMedia(mediaItems);
  });

  private resolveMedia(mediaItems: IGalleryInputData[]): void {
    this.loadingService.show({
      title: 'Loading Attachments',
      message: 'Please wait while we load the attachments...',
    });

    const requests = mediaItems.map(item => {
      const hasDirectUrls = !!item.actualMediaUrl && !!item.thumbnailMediaUrl;
      if (hasDirectUrls) {
        // Direct media: no API call, just wrap the existing URL
        return of({ url: item.actualMediaUrl ?? '' });
      }

      return this.attachmentsService.getFullMediaUrl(item.mediaKey).pipe(
        catchError(error => {
          this.logger.logUserAction('Error loading attachment', {
            mediaKey: item.mediaKey,
            error,
          });
          return of({ url: null as string | null });
        })
      );
    });

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (
          responses: (IAttachmentsGetResponseDto | { url: string | null })[]
        ) => {
          const updatedMedia: IGalleryResolvedItem[] = mediaItems.map(
            (item, index) => {
              const response = responses[index];
              const resolvedUrl =
                (response as IAttachmentsGetResponseDto).url ??
                (response as { url: string | null }).url ??
                null;

              const actualUrl = resolvedUrl ?? item.actualMediaUrl ?? '';
              const hasError = !resolvedUrl && !item.actualMediaUrl;

              const baseName =
                item.mediaTitle ?? item.mediaDescription ?? item.mediaKey ?? '';
              const explicitExtension = baseName.includes('.')
                ? (baseName.split('.').pop()?.toLowerCase() ?? '')
                : '';

              const dummyUrl = explicitExtension
                ? `file.${explicitExtension}`
                : actualUrl;
              const mediaType = dummyUrl
                ? getMediaTypeFromUrl(dummyUrl)
                : 'unsupported';
              const fileExtension = dummyUrl ? getFileExtension(dummyUrl) : '';

              return {
                mediaKey: item.mediaKey,
                actualMediaUrl: actualUrl,
                thumbnailMediaUrl: actualUrl,
                mediaDescription: item.mediaDescription,
                mediaTitle: item.mediaTitle,
                mediaType,
                fileExtension,
                fileIcon:
                  this.icons.MEDIA[
                    mediaType.toUpperCase() as keyof typeof this.icons.MEDIA
                  ],
                hasError,
              };
            }
          );

          this.resolvedMedia.set(updatedMedia);
          this.displayBasic.set(true);
          this.logger.logUserAction('Attachments loaded successfully');
        },
      });
  }

  onActiveIndexChange(event: number): void {
    this.logger.debug('Active index changed', event);
  }

  onVisibleChange(event: boolean): void {
    this.logger.debug('Visible changed', event);

    if (!event) {
      this.activeIndex.set(0);
      this.closed.emit();
    }
  }

  openPdfFullscreen(pdfUrl: string): void {
    this.currentPdfUrl.set(pdfUrl);
    this.displayPdfFullscreen.set(true);
  }

  closePdfFullscreen(): void {
    this.displayPdfFullscreen.set(false);
    this.currentPdfUrl.set(null);
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

  getSafeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  handleImageError(file: IGalleryResolvedItem): void {
    file.hasError = true;
    this.logger.logUserAction('Gallery image failed to load', {
      mediaTitle: file.mediaTitle,
      mediaUrl: file.actualMediaUrl,
    });
  }
}
