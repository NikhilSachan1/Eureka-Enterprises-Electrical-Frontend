import { Directive, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DrawerService } from '@shared/services/drawer.service';
import { LoggerService } from '@core/services';
import { IDrawerEvent } from '@shared/types';

@Directive()
export abstract class DrawerDetailBase implements OnInit {
  protected readonly drawerService = inject(DrawerService);
  protected readonly logger = inject(LoggerService);
  protected readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.subscribeToDrawerEvents();
  }

  private subscribeToDrawerEvents(): void {
    this.drawerService
      .getDrawerEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event: IDrawerEvent) => {
          this.handleDrawerEvent(event);
        },
        error: error => {
          this.logger.logUserAction(
            'Error in drawer events subscription',
            error
          );
        },
      });
  }

  private handleDrawerEvent(event: IDrawerEvent): void {
    switch (event.type) {
      case 'show':
        this.onDrawerShow();
        break;
      case 'hide':
        this.onDrawerHide();
        break;
      case 'visibleChange':
        this.onDrawerVisibleChange(event.visible ?? false);
        break;
      default:
        this.logger.logUserAction('Unknown drawer event type', event.type);
        break;
    }
  }

  protected onDrawerShow(): void {
    this.logger.logUserAction(`drawer shown`);
  }

  protected onDrawerHide(): void {
    this.logger.logUserAction(`drawer hidden`);
  }

  protected onDrawerVisibleChange(visible: boolean): void {
    this.logger.logUserAction(`drawer visibility changed to: ${visible}`);
  }
}
