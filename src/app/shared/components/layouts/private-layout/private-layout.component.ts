import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-private-layout',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './private-layout.component.html',
  styleUrl: './private-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateLayoutComponent {}
