import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { ROUTE_BASE_PATHS } from './app/shared/constants';

console.warn(
  `Angular is running in ${environment.ENVIRONMENT.toUpperCase()} mode.`
);

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // eslint-disable-next-line no-alert -- one-off feature announcement, intentionally a native alert
    alert(
      'New: Advance payment for Expense & Fuel.\n\n' +
        'Employees with a balance of ₹0 or less can now be added to a payment sheet. ' +
        'Edit their line on the sheet to enter the advance amount before forwarding.'
    );
  })
  .catch(err => {
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
