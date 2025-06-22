import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        // Animations with async loading
        provideAnimations(),
        
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
            withInterceptors([
                authInterceptor,      // Handle authentication tokens
                ErrorInterceptor,     // Handle HTTP errors
            ])
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
        { provide: MessageService },
        
        // Import PrimeNG modules
        importProvidersFrom(BrowserAnimationsModule)
    ]
};
