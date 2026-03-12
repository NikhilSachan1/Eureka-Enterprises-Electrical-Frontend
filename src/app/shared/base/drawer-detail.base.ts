import { Directive, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DrawerService } from '@shared/services/drawer.service';
import { IDrawerEvent } from '@shared/types';

@Directive()
export abstract class DrawerDetailBase implements OnInit {
  protected readonly drawerService = inject(DrawerService);
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
        error: (): void => {
          void 0;
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
        break;
    }
  }

  protected onDrawerShow(): void {
    void 0;
  }

  protected onDrawerHide(): void {
    void 0;
  }

  protected onDrawerVisibleChange(_visible: boolean): void {
    void 0;
  }
}
