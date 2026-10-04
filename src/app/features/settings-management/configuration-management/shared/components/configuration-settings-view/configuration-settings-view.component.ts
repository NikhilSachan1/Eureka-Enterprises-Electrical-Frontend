import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { IConfigurationGetBaseResponseDto } from '../../../types/configuration.dto';
import {
  ConfigView,
  toConfigView,
  trimmedContext,
} from '../../utils/config-value-display.util';

type IConfigurationSetting =
  IConfigurationGetBaseResponseDto['configSettings'][number];

@Component({
  selector: 'app-configuration-settings-view',
  imports: [DatePipe, NgTemplateOutlet],
  templateUrl: './configuration-settings-view.component.html',
  styleUrl: './configuration-settings-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationSettingsViewComponent {
  readonly settings = input<IConfigurationSetting[]>([]);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly trimmedContext = trimmedContext;

  protected hasSettingMeta(setting: IConfigurationSetting): boolean {
    return (
      this.settings().length > 1 ||
      !!this.trimmedContext(setting.contextKey) ||
      !!setting.effectiveFrom ||
      !!setting.effectiveTo ||
      !setting.isActive
    );
  }

  protected viewOf(value: unknown): ConfigView {
    return toConfigView(value);
  }
}
