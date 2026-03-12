import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
  Injector,
  computed,
  HostListener,
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
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { EDrawerPosition, EDrawerSize } from '@shared/types';

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
  private readonly injector = inject(Injector);

  protected readonly visible = signal<boolean>(false);
  protected readonly currentConfig = signal<IDrawerConfig>({} as IDrawerConfig);
  protected readonly _componentInjector = computed(() =>
    this.componentInjector()
  );
  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );
  protected readonly isMobile = signal(window.innerWidth <= 768);

  protected readonly ALL_DRAWER_POSITIONS = EDrawerPosition;

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }

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
        },
        error: (): void => {
          void 0;
        },
      });
  }

  protected onDrawerVisibleChange(): void {
    this.drawerService.emitDrawerVisibleChange(this.visible());
  }

  protected onDrawerShow(): void {
    this.drawerService.emitDrawerShow();
  }

  protected onDrawerHide(): void {
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

  protected getDrawerStyle(): Record<string, string> | null {
    const size = this.currentConfig()?.size ?? EDrawerSize.DEFAULT;
    const sizeConfig = this.DRAWER_SIZES.find(config => config.size === size);

    if (this.isMobile() || size === EDrawerSize.DEFAULT || !sizeConfig) {
      return null;
    }

    return {
      width: sizeConfig.width,
      maxWidth: sizeConfig.maxWidth,
    };
  }

  private readonly DRAWER_SIZES = [
    { size: EDrawerSize.SMALL, width: '50vw', maxWidth: '600px' },
    { size: EDrawerSize.MEDIUM, width: '70vw', maxWidth: '800px' },
    { size: EDrawerSize.LARGE, width: '90vw', maxWidth: '1000px' },
  ] as const;
}
