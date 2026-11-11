import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

/** Chromium-only event; not in lib.dom yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_AT_KEY = 'pwa_install_dismissed_at';
const SNOOZE_MS = 1 * 24 * 60 * 60 * 1000; // ask again after 1 days
const MOBILE_QUERY = '(max-width: 768px), (pointer: coarse)';

/**
 * Tracks whether the app can be installed to the home screen and drives the
 * install prompt. Instantiated at app start so the browser's one-time
 * `beforeinstallprompt` event is not missed.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  private readonly canPrompt = signal(false);
  private readonly installed = signal(this.detectStandalone());
  private readonly snoozed = signal(this.readSnoozed());
  private readonly mobile = signal(this.matchMobile());

  /** iOS Safari has no install API — users must use Share → Add to Home Screen. */
  readonly isIos = this.detectIosSafari();

  /** True when the app can be installed (native prompt or iOS manual steps). */
  readonly canInstall = computed(
    () => !this.installed() && (this.canPrompt() || this.isIos)
  );

  /** Whether the mobile install banner should be visible. */
  readonly showBanner = computed(
    () => this.canInstall() && this.mobile() && !this.snoozed()
  );

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    const onBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canPrompt.set(true);
    };
    const onInstalled = (): void => {
      this.deferredPrompt = null;
      this.canPrompt.set(false);
      this.installed.set(true);
    };
    const mediaQuery = window.matchMedia?.(MOBILE_QUERY);
    const onMediaChange = (event: MediaQueryListEvent): void =>
      this.mobile.set(event.matches);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    mediaQuery?.addEventListener?.('change', onMediaChange);

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      mediaQuery?.removeEventListener?.('change', onMediaChange);
    });
  }

  /** Opens the native install dialog. Resolves true if the user accepted. */
  async promptInstall(): Promise<boolean> {
    const promptEvent = this.deferredPrompt;
    if (!promptEvent) {
      return false;
    }
    // The event can only be used once.
    this.deferredPrompt = null;
    this.canPrompt.set(false);

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'dismissed') {
      this.dismiss();
    }
    return outcome === 'accepted';
  }

  /** Hides the banner for a few days. */
  dismiss(): void {
    this.snoozed.set(true);
    try {
      localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    } catch {
      // Storage blocked (private mode) — banner stays hidden for this session only.
    }
  }

  private readSnoozed(): boolean {
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY));
      return !!dismissedAt && Date.now() - dismissedAt < SNOOZE_MS;
    } catch {
      return false;
    }
  }

  private detectStandalone(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }

  private matchMobile(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.(MOBILE_QUERY).matches;
  }

  private detectIosSafari(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent;
    // iPadOS 13+ reports itself as Mac; detect via touch support.
    const isIosDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
    // Only Safari can add to home screen on older iOS; skip in-app browsers.
    const isOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|FBAN|FBAV|Instagram/.test(ua);
    return isIosDevice && !isOtherBrowser;
  }
}
