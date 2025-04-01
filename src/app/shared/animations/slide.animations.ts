import { trigger, transition, style, animate, state } from '@angular/animations';

export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('200ms ease-out', 
      style({ transform: 'translateX(0)' })
    )
  ]),
  transition(':leave', [
    animate('200ms ease-out', 
      style({ transform: 'translateX(-100%)' })
    )
  ])
]);

export const slideInOutRight = trigger('slideInOutRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(0)' })
    )
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateX(100%)' })
    )
  ])
]);

export const slideInOutUp = trigger('slideInOutUp', [
  transition(':enter', [
    style({ transform: 'translateY(100%)' }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateY(0)' })
    )
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateY(100%)' })
    )
  ])
]);

export const slideInOutDown = trigger('slideInOutDown', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)' }),
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateY(0)' })
    )
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
      style({ transform: 'translateY(-100%)' })
    )
  ])
]); 