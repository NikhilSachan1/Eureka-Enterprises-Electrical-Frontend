import { Injectable, signal, Type, computed } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  IDrawerConfig,
  IDrawerState,
  IEnhancedDrawer,
  IDrawerEvent,
} from '@shared/models/';
import { DEFAULT_DRAWER_CONFIG } from '@shared/config/drawer.config';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private readonly drawerState$ = new BehaviorSubject<IDrawerState>({
    config: {} as IDrawerConfig,
    visible: false,
  });

  private readonly _config = signal<IDrawerConfig>({} as IDrawerConfig);
  private readonly _visible = signal<boolean>(false);

  private readonly drawerEvents$ = new Subject<IDrawerEvent>();

  readonly config = computed(() => this._config());
  readonly visible = computed(() => this._visible());

  getDrawerState(): Observable<IDrawerState> {
    return this.drawerState$.asObservable();
  }

  // Method to get drawer events observable
  getDrawerEvents(): Observable<IDrawerEvent> {
    return this.drawerEvents$.asObservable();
  }

  emitDrawerShow(): void {
    const currentConfig = this._config();
    this.drawerEvents$.next({
      type: 'show',
      componentData: currentConfig.componentData,
    });
  }

  emitDrawerHide(): void {
    const currentConfig = this._config();
    this.drawerEvents$.next({
      type: 'hide',
      componentData: currentConfig.componentData,
    });
  }

  emitDrawerVisibleChange(visible: boolean): void {
    const currentConfig = this._config();
    this.drawerEvents$.next({
      type: 'visibleChange',
      visible,
      componentData: currentConfig.componentData,
    });
  }

  createDrawer(): IEnhancedDrawer {
    return {
      config: this.config,
      visible: this.visible,

      show: (config: IDrawerConfig): void => {
        const finalConfig: IDrawerConfig = {
          ...DEFAULT_DRAWER_CONFIG,
          ...config,
        };

        this._config.set(finalConfig);
        this._visible.set(true);
        this.drawerState$.next({
          config: finalConfig,
          visible: true,
        });
      },

      hide: (): void => {
        const currentConfig = this._config();
        this._visible.set(false);
        this.drawerState$.next({
          config: currentConfig,
          visible: false,
        });
      },
    };
  }

  showDrawer<T = unknown>(
    component: Type<T>,
    config?: Partial<Omit<IDrawerConfig, 'component'>>
  ): IEnhancedDrawer {
    const drawer = this.createDrawer();
    drawer.show({
      component,
      ...config,
    } as IDrawerConfig);
    return drawer;
  }

  hideDrawer(): void {
    const drawer = this.createDrawer();
    drawer.hide();
  }
}
