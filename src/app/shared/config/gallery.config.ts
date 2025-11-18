import { IGalleryConfig } from '@shared/models';

export const DEFAULT_GALLERY_CONFIG: IGalleryConfig = {
  activeIndex: 0,
  fullScreen: true,
  numVisible: 5,
  showNavigators: true,
  showThumbnailNavigators: true,
  showNavigatorsOnHover: true,
  changeOnIndicatorHover: false,
  circular: true,
  autoPlay: false,
  transitionInterval: 1000,
  showThumbnails: false,
  thumbnailsPosition: 'bottom',
  showIndicators: true,
  showIndicatorsOnItem: true,
  indicatorsPosition: 'bottom',
};
