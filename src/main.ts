import './environments/mock-system-date.bootstrap';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { ROUTE_BASE_PATHS } from './app/shared/constants';

console.warn(
  `Angular is running in ${environment.ENVIRONMENT.toUpperCase()} mode.`
);

bootstrapApplication(AppComponent, appConfig).catch(err => {
  console.error('Bootstrap failed', err);
  sessionStorage.setItem('critical_startup_failed', '1');
  const startupErrorPath = `/${ROUTE_BASE_PATHS.STARTUP_ERROR}`;
  if (!window.location.pathname.startsWith(startupErrorPath)) {
    const requestedUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    sessionStorage.setItem('critical_startup_redirect_url', requestedUrl);
    window.location.replace(
      `${startupErrorPath}?redirect=${encodeURIComponent(requestedUrl)}`
    );
  }
});
