import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
  Injector,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgComponentOutlet } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';

import { DrawerService } from '@shared/services/drawer.service';
import {
  IDrawerConfig,
  IDrawerPageHeaderConfig,
  IDrawerState,
} from '@shared/types/drawer/drawer.interface';
import { LoggerService } from '@core/services';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { EDrawerPosition } from '@shared/types';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [DrawerModule, NgComponentOutlet],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent implements OnInit {
  private readonly drawerService = inject(DrawerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly injector = inject(Injector);

  protected readonly visible = signal<boolean>(false);
  protected readonly currentConfig = signal<IDrawerConfig>({} as IDrawerConfig);
  protected readonly _componentInjector = computed(() =>
    this.componentInjector()
  );
  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );

  protected readonly ALL_DRAWER_POSITIONS = EDrawerPosition;

  ngOnInit(): void {
    this.initializeDrawerStateSubscription();
  }

  private initializeDrawerStateSubscription(): void {
    this.drawerService
      .getDrawerState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state: IDrawerState) => {
          this.currentConfig.set(state.config);
          this.visible.set(state.visible);

          if (state.visible && state.config?.component) {
            this.logger.logUserAction('Drawer opened with component', {
              component: state.config.component.name,
              data: state.config.componentData,
            });
          }
        },
        error: error => {
          this.logger.logUserAction(
            'Error in drawer state subscription',
            error
          );
        },
      });
  }

  protected onDrawerVisibleChange(): void {
    this.logger.logUserAction('Drawer visible changed');
    this.drawerService.emitDrawerVisibleChange(this.visible());
  }

  protected onDrawerShow(): void {
    this.logger.logUserAction('Drawer shown');
    this.drawerService.emitDrawerShow();
  }

  protected onDrawerHide(): void {
    this.logger.logUserAction('Drawer closed');
    this.drawerService.emitDrawerHide();
  }

  private componentInjector(): Injector {
    const config = this.currentConfig();
    if (config.componentData) {
      return Injector.create({
        providers: [
          {
            provide: DRAWER_DATA,
            useValue: config.componentData,
          },
        ],
        parent: this.injector,
      });
    }
    return this.injector;
  }

  private getPageHeaderConfig(): IDrawerPageHeaderConfig {
    return {
      title: this.currentConfig().header,
      subtitle: this.currentConfig().subtitle,
    };
  }
}
