import { Component, VERSION } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HasPermissionDirective } from './shared/directives/has-permission.directive';
import { PERMISSIONS } from './core/constants/permission.constants';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [HasPermissionDirective],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {

  angularVersion = VERSION.full;
  userPermissions = PERMISSIONS.USERS;
}
