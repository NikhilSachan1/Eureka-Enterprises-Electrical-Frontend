import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { AppConfigurationService } from '@shared/services';
import { mapProjectSiteTypeDisplays } from '../../utility/project-site-type.util';

@Component({
  selector: 'app-project-site-type-chips',
  imports: [ChipComponent],
  templateUrl: './project-site-type-chips.component.html',
  styleUrl: './project-site-type-chips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSiteTypeChipsComponent {
  readonly siteTypes = input<readonly string[]>([]);

  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly displays = computed(() =>
    mapProjectSiteTypeDisplays(
      this.siteTypes(),
      this.appConfigurationService.projectSiteTypes()
    )
  );
}
