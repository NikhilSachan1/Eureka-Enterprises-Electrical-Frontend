import { Injectable, signal, computed } from '@angular/core';
import { ILoader } from '@shared/models';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    private readonly defaultConfig = {
        isLoading: false,
        title: 'Loading...',
        message: 'Please wait...',
    };

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
        this._loadingState.set({
            ...this.defaultConfig,
            ...config,
            isLoading: true, // Always true when showing
        });
    }

    /**
     * Hide loading overlay
     */
    hide(): void {
        this._loadingState.set({
            ...this.defaultConfig,
            isLoading: false
        });
    }
} 