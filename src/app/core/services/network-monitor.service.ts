import { Injectable, signal, effect } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NetworkMonitorService {
  readonly isOnline = signal<boolean>(navigator.onLine);
  readonly showOfflineOverlay = signal<boolean>(false);
  private hideTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.initializeNetworkMonitoring();
    this.setupOfflineOverlay();
  }

  private initializeNetworkMonitoring(): void {
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    merge(online$, offline$)
      .pipe(debounceTime(100))
      .subscribe(isOnline => {
        this.isOnline.set(isOnline);
      });
  }

  private setupOfflineOverlay(): void {
    effect(() => {
      const online = this.isOnline();

      // Clear any existing timeout
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = undefined;
      }

      if (!online) {
        // Show overlay immediately when offline
        this.showOfflineOverlay.set(true);
      } else {
        // Wait 2 seconds before hiding overlay when back online
        this.hideTimeout = setTimeout(() => {
          this.showOfflineOverlay.set(false);
        }, 2000);
      }
    });
  }
}
