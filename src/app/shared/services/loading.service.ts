import { Injectable, signal, computed } from '@angular/core';
import { ILoader } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly defaultConfig: ILoader = {
    isLoading: false,
    title: 'Loading...',
    message: 'Please wait...',
  };

  // Stack to track multiple concurrent loaders
  private readonly loaderStack: ILoader[] = [];

  // Private signal for loading state
  private readonly _loadingState = signal<ILoader>(this.defaultConfig);

  // Public readonly signal
  public readonly loadingState = this._loadingState.asReadonly();

  // Computed signals for convenience
  public readonly isLoading = computed(() => this._loadingState().isLoading);
  public readonly title = computed(() => this._loadingState().title);
  public readonly message = computed(() => this._loadingState().message);

  /**
   * Show loading overlay with custom configuration
   */
  show(config: Partial<ILoader> = {}): void {
    const loaderConfig: ILoader = {
      ...this.defaultConfig,
      ...config,
      isLoading: true,
    };

    // Push to stack
    this.loaderStack.push(loaderConfig);

    // Update state with latest loader config
    this._loadingState.set(loaderConfig);
  }

  /**
   * Hide loading overlay
   */
  hide(): void {
    // Pop from stack
    this.loaderStack.pop();

    if (this.loaderStack.length > 0) {
      // Still have loaders in stack, show the previous one
      const previousLoader = this.loaderStack[this.loaderStack.length - 1];
      this._loadingState.set(previousLoader);
    } else {
      // Stack is empty, actually hide
      this._loadingState.set({
        ...this.defaultConfig,
        isLoading: false,
      });
    }
  }

  forceHideAll(): void {
    this.loaderStack.length = 0;
    this._loadingState.set({
      ...this.defaultConfig,
      isLoading: false,
    });
  }

  get stackSize(): number {
    return this.loaderStack.length;
  }
}
