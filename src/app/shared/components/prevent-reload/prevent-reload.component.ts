import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { ICanComponentDeactivate } from '@core/types';
import { LoggerService } from '@core/services';

@Component({
  selector: 'app-prevent-reload',
  imports: [],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class PreventReloadComponent
  implements ICanComponentDeactivate, OnInit, OnDestroy
{
  protected readonly logger = inject(LoggerService);
  private beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null =
    null;
  abstract canDeactivate(): boolean;

  ngOnInit(): void {
    this.setupBeforeUnloadHandler();
  }

  private setupBeforeUnloadHandler(): void {
    this.beforeUnloadHandler = (event: BeforeUnloadEvent): void => {
      if (!this.canDeactivate()) {
        this.logger.info(
          `${this.constructor.name}: Page reload detected with unsaved changes`
        );
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private removeBeforeUnloadHandler(): void {
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.canDeactivate()) {
      this.logger.info(
        `${this.constructor.name}: Page reload detected with unsaved changes`
      );
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.removeBeforeUnloadHandler();
  }
}
