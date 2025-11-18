import { SafeResourceUrl } from '@angular/platform-browser';

// Base interface for common properties
interface IGalleryDataBase {
  thumbnailMediaUrl: string;
  mediaDescription: string;
  mediaTitle: string;
}

// Input interface - what users provide
export interface IGalleryInputData extends IGalleryDataBase {
  actualMediaUrl: string;
}

// Internal interface - what the component uses
export interface IGalleryData extends IGalleryDataBase {
  actualMediaUrl: string | SafeResourceUrl;
  mediaType: string;
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
