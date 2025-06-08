import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        // Animations with async loading
        provideAnimationsAsync(),
        
        // PrimeNG configuration
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.my-app-dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'tailwind, primeng',
                    },
                }
            }
        }),
        
        // Angular V19: Optimized change detection with event coalescing
        provideZoneChangeDetection({ 
            eventCoalescing: true,
            runCoalescing: true 
        }),
        
        // Angular V19: HTTP client with Fetch API and interceptors
        provideHttpClient(
            withFetch(),
            withInterceptors([ErrorInterceptor, LoggingInterceptor])
        ),
        
        // Angular V19: Enhanced router with component input binding
        provideRouter(
            routes, 
            withComponentInputBinding(),
            withInMemoryScrolling({ 
                anchorScrolling: 'enabled', 
                scrollPositionRestoration: 'enabled' 
            }), 
            withEnabledBlockingInitialNavigation()
        ),
        
        // Services
        { provide: ConfirmationService, useClass: ConfirmationService },
        { provide: MessageService, useClass: MessageService }
    ]
};
