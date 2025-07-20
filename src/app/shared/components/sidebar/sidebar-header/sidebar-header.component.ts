import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { AppConfigService } from '@core/services';

@Component({
  selector: 'app-sidebar-header',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarHeaderComponent {
  private readonly appConfigService = inject(AppConfigService);

  // Using computed signals for reactive data - Angular v19 best practice
  readonly companyName = computed(() => this.appConfigService.appName);
  readonly companyDescription = computed(
    () => this.appConfigService.appDescription
  );
}
