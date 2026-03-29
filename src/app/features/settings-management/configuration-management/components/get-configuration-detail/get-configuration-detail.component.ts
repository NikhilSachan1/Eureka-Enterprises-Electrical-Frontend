import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  IConfigurationDetailGetFormDto,
  IConfigurationDetailGetResponseDto,
  IConfigurationGetBaseResponseDto,
} from '../../types/configuration.dto';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { toTitleCase } from '@shared/utility';
import { ConfigurationService } from '../../services/configuration.service';
import { LoadingService } from '@shared/services';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type ConfigurationValueKind = 'nullish' | 'primitive' | 'array' | 'object';

@Component({
  selector: 'app-get-configuration-detail',
  imports: [ViewDetailComponent, DatePipe, NgTemplateOutlet, NgClass],
  templateUrl: './get-configuration-detail.component.html',
  styleUrl: './get-configuration-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetConfigurationDetailComponent extends DrawerDetailBase {
  private readonly configurationService = inject(ConfigurationService);
  private readonly loadingService = inject(LoadingService);

  protected readonly APP_CONFIG = APP_CONFIG;

  /** Config value tree recursion limit (inline template). */
  protected readonly maxDepth = 32;

  protected readonly drawerData = inject(DRAWER_DATA) as {
    configuration: IConfigurationGetBaseResponseDto;
  };

  protected readonly _configurationDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadConfigurationDetails();
  }

  private loadConfigurationDetails(): void {
    this.loadingService.show({
      title: 'Loading Configuration Details',
      message: 'Please wait while we load the configuration details...',
    });

    const paramData = this.prepareParamData();

    this.configurationService
      .getConfigurationDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IConfigurationDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._configurationDetails.set(mappedData);
          this.logger.logUserAction(
            'Configuration details loaded successfully'
          );
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IConfigurationDetailGetFormDto {
    return {
      configurationId: this.drawerData.configuration.id,
    };
  }

  private mapDetailData(
    response: IConfigurationGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = [response].map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Value Type',
          value:
            typeof record.valueType === 'string'
              ? record.valueType.trim()
              : record.valueType,
          type: EDataType.TEXT,
        },
        {
          label: 'Description',
          value:
            typeof record.description === 'string'
              ? record.description.trim()
              : record.description,
          type: EDataType.TEXT,
        },
        {
          label: 'Config Settings',
          value: record.configSettings,
          customTemplateKey: 'configurationConfigSettings',
        },
      ];

      return {
        entryData,
      };
    });

    return {
      details: mappedDetails,
      entity: this.getConfigurationDetails(),
    };
  }

  protected getConfigurationDetails(): IEntityViewDetails {
    const { configuration } = this.drawerData;
    return {
      name: `${toTitleCase(configuration.module)} - ${toTitleCase(configuration.label)}`,
      subtitle: configuration.key ?? 'N/A',
    };
  }

  /** Trimmed non-empty context for display; empty after trim → hidden in template. */
  protected trimmedContext(key: string | null | undefined): string {
    if (key === null || typeof key !== 'string') {
      return '';
    }
    return key.trim();
  }

  protected getStructureDisplay(value: unknown): string {
    if (value === null || value === undefined) {
      return '—';
    }
    if (value instanceof Date) {
      return '—';
    }
    if (Array.isArray(value)) {
      const n = value.length;
      return `${n} ${n === 1 ? 'row' : 'rows'}`;
    }
    if (typeof value === 'object') {
      const n = Object.keys(value).length;
      return `${n} ${n === 1 ? 'field' : 'fields'}`;
    }
    return 'Scalar';
  }

  // --- Inline config value tree (ng-template) helpers ---

  protected getConfigValueKind(value: unknown): ConfigurationValueKind {
    return classifyConfigurationValue(value);
  }

  protected getConfigObjectEntries(value: unknown): [string, unknown][] {
    if (!isPlainObject(value)) {
      return [];
    }
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .map(k => [k, value[k]]);
  }

  protected getConfigArrayItems(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  protected trimDisplayKey(key: string): string {
    return key.trim();
  }

  protected formatConfigPrimitive(v: unknown): string {
    if (v === null || v === undefined) {
      return '—';
    }
    if (typeof v === 'boolean') {
      return v ? 'true' : 'false';
    }
    if (typeof v === 'bigint') {
      return v.toString();
    }
    if (v instanceof Date) {
      return v.toISOString();
    }
    if (typeof v === 'number') {
      return Number.isFinite(v) ? String(v) : String(v);
    }
    if (typeof v === 'string') {
      const t = v.trim();
      if (t === '') {
        return '—';
      }
      return t.length > 2000 ? `${t.slice(0, 2000)}…` : t;
    }
    return String(v).trim() || '—';
  }

  protected configPrimitiveClass(v: unknown): string {
    if (v === null || v === undefined) {
      return 'cvt-primitive--muted';
    }
    if (typeof v === 'boolean') {
      return 'cvt-primitive--bool';
    }
    if (typeof v === 'number' || typeof v === 'bigint') {
      return 'cvt-primitive--num';
    }
    return 'cvt-primitive--str';
  }
}

function classifyConfigurationValue(value: unknown): ConfigurationValueKind {
  if (value === null || value === undefined) {
    return 'nullish';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  const t = typeof value;
  if (t === 'object') {
    if (value instanceof Date) {
      return 'primitive';
    }
    return 'object';
  }
  return 'primitive';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
