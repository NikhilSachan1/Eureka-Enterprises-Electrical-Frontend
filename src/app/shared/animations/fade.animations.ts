import { trigger, transition, style, animate } from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-in-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('200ms ease-in-out', style({ opacity: 0 }))]),
]);

export const fadeInOutScale = trigger('fadeInOutScale', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
  ]),
]);

export const fadeInOutSlide = trigger('fadeInOutSlide', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate(
      '200ms ease-out',
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '200ms ease-in',
      style({ opacity: 0, transform: 'translateY(10px)' })
    ),
  ]),
]);

export const fadeInOutSlideX = trigger('fadeInOutSlideX', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(10px)' }),
    animate(
      '200ms ease-out',
      style({ opacity: 1, transform: 'translateX(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '200ms ease-in',
      style({ opacity: 0, transform: 'translateX(10px)' })
    ),
  ]),
]);
