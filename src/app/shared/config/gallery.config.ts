import { IGalleryConfig } from '@shared/types';

export const DEFAULT_GALLERY_CONFIG: IGalleryConfig = {
  activeIndex: 0,
  fullScreen: true,
  numVisible: 5,
  showNavigators: false,
  showThumbnailNavigators: true,
  showNavigatorsOnHover: false,
  changeOnIndicatorHover: false,
  circular: true,
  autoPlay: false,
  transitionInterval: 1000,
  showThumbnails: false,
  thumbnailsPosition: 'bottom',
  showIndicators: true,
  showIndicatorsOnItem: false,
  indicatorsPosition: 'bottom',
  customNavigators: true,
};
