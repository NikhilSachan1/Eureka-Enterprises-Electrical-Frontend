import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

console.warn(
  `Angular is running in ${environment.ENVIRONMENT.toUpperCase()} mode.`
);

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
