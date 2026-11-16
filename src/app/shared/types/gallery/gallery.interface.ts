import type { SafeResourceUrl } from '@angular/platform-browser';

// Input interface - what users provide
export interface IGalleryInputData {
  mediaKey: string;
  actualMediaUrl?: string;
}

export interface IGalleryResolvedItem extends IGalleryInputData {
  mediaType: string;
  fileExtension: string;
  fileIcon: string;
  hasError?: boolean;
  /** Word / Excel / PowerPoint: Microsoft's Office viewer for this file (null otherwise). */
  officeViewerUrl?: SafeResourceUrl | null;
}

export interface IGalleryConfig {
  activeIndex: number;
  fullScreen: boolean;
  numVisible: number;
  showNavigators: boolean;
  showThumbnailNavigators: boolean;
  showNavigatorsOnHover: boolean;
  changeOnIndicatorHover: boolean;
  circular: boolean;
  autoPlay: boolean;
  transitionInterval: number;
  showThumbnails: boolean;
  thumbnailsPosition: 'top' | 'bottom' | 'left' | 'right';
  showIndicators: boolean;
  showIndicatorsOnItem: boolean;
  indicatorsPosition: 'top' | 'bottom' | 'left' | 'right';
}
