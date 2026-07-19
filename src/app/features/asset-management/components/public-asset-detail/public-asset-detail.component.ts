import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import { IAssetDetailGetResponseDto } from '@features/asset-management/types/asset.dto';
import {
  IPublicAssetDetailRow,
  IPublicAssetDetailSection,
} from '@features/asset-management/types/public-asset-detail.interface';
import { ICONS } from '@shared/constants';
import { AppConfigurationService, GalleryService } from '@shared/services';
import { IGalleryInputData, IOptionDropdown } from '@shared/types';
import {
  getMappedValueFromArrayOfObjects,
  transformDateFormat,
} from '@shared/utility';

@Component({
  selector: 'app-public-asset-detail',
  imports: [],
  templateUrl: './public-asset-detail.component.html',
  styleUrl: './public-asset-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicAssetDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly galleryService = inject(GalleryService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private readonly emptyValue = '—';
  private readonly fallbackAssetName = 'Asset';

  protected readonly companyName = APP_CONFIG.name;
  protected readonly logoPath = APP_CONFIG.logoPath;
  protected readonly watermarkText = APP_CONFIG.name.toUpperCase();
  protected readonly year = new Date().getFullYear();
  protected readonly errorIcon = ICONS.COMMON.EXCLAMATION_TRIANGLE;
  protected readonly paperclipIcon = ICONS.COMMON.PAPERCLIP;
  protected readonly chevronIcon = ICONS.COMMON.CHEVRON_RIGHT;

  protected readonly watermarkBg = this.buildWatermarkBackground(
    this.watermarkText
  );

  protected readonly asset = signal(
    (this.route.snapshot.data[
      'publicAsset'
    ] as IAssetDetailGetResponseDto | null) ?? null
  );

  protected readonly hasError = computed(() => this.asset() === null);

  protected readonly assetName = computed(() => {
    const name = this.asset()?.name?.trim();
    if (!name) {
      return this.fallbackAssetName;
    }
    return name;
  });
  protected readonly assetCode = computed(() => {
    const code = this.asset()?.assetId?.trim();
    if (!code) {
      return this.emptyValue;
    }
    return code;
  });

  protected readonly sections = computed(() =>
    this.buildSections(this.asset())
  );

  protected readonly attachmentKeys = computed(() =>
    this.getAttachmentKeys(this.asset())
  );

  protected openAttachments(): void {
    const keys = this.attachmentKeys();
    if (keys.length === 0) {
      return;
    }
    const media: IGalleryInputData[] = keys.map(key => ({
      mediaKey: key,
      actualMediaUrl: '',
    }));
    this.galleryService.show(media);
  }

  private getAttachmentKeys(
    asset: IAssetDetailGetResponseDto | null
  ): string[] {
    if (!asset?.files?.length) {
      return [];
    }
    return asset.files
      .map(file => file.fileKey?.trim())
      .filter((key): key is string => !!key);
  }

  private buildSections(
    asset: IAssetDetailGetResponseDto | null
  ): IPublicAssetDetailSection[] {
    if (!asset) {
      return [];
    }

    const sections: IPublicAssetDetailSection[] = [
      {
        title: 'General Information',
        icon: ICONS.ASSET.BOX,
        rows: [
          {
            label: 'Category',
            value: this.mappedLabel(
              this.appConfigurationService.assetCategories(),
              asset.category
            ),
          },
          {
            label: 'Asset Type',
            value: this.mappedLabel(
              this.appConfigurationService.assetTypes(),
              asset.assetType
            ),
          },
          { label: 'Model', value: this.text(asset.model) },
          { label: 'Serial Number', value: this.text(asset.serialNumber) },
        ],
      },
      {
        title: 'Calibration',
        icon: ICONS.COMMON.CHART_LINE,
        rows: [
          {
            label: 'Calibration From',
            value: asset.calibrationFrom
              ? this.mappedLabel(
                  this.appConfigurationService.assetCalibrationSources(),
                  asset.calibrationFrom
                )
              : this.emptyValue,
          },
          {
            label: 'Frequency',
            value: asset.calibrationFrequency
              ? this.mappedLabel(
                  this.appConfigurationService.assetCalibrationFrequencies(),
                  asset.calibrationFrequency
                )
              : this.emptyValue,
          },
          {
            label: 'Calibrated On',
            value: this.formatDate(asset.calibrationStartDate),
          },
          {
            label: 'Valid Until',
            value: this.formatDate(asset.calibrationEndDate),
          },
        ],
      },
      {
        title: 'Warranty & Purchase',
        icon: ICONS.SECURITY.SHIELD,
        rows: [
          {
            label: 'Purchase Date',
            value: this.formatDate(asset.purchaseDate),
          },
          { label: 'Vendor', value: this.text(asset.vendorName) },
          {
            label: 'Warranty Start',
            value: this.formatDate(asset.warrantyStartDate),
          },
          {
            label: 'Warranty End',
            value: this.formatDate(asset.warrantyEndDate),
          },
        ],
      },
    ];

    const remarks = this.text(asset.remarks);
    if (remarks !== this.emptyValue) {
      sections.push({
        title: 'Additional Notes',
        icon: ICONS.PAYROLL.GENERATE,
        rows: [{ label: 'Remarks', value: remarks }],
      });
    }

    return sections
      .map(section => ({
        ...section,
        rows: section.rows.filter(
          (row: IPublicAssetDetailRow) => row.value !== this.emptyValue
        ),
      }))
      .filter(section => section.rows.length > 0);
  }

  private mappedLabel(
    options: IOptionDropdown[],
    rawValue: string | null | undefined
  ): string {
    if (!rawValue?.trim()) {
      return this.emptyValue;
    }
    const mapped = getMappedValueFromArrayOfObjects(options, rawValue);
    return typeof mapped === 'string' && mapped.trim()
      ? mapped
      : this.emptyValue;
  }

  private text(value: string | null | undefined): string {
    const trimmed = value?.trim();
    if (!trimmed) {
      return this.emptyValue;
    }
    return trimmed;
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) {
      return this.emptyValue;
    }
    const formatted = transformDateFormat(
      value,
      APP_CONFIG.DATE_FORMATS.DEFAULT
    );
    return formatted || this.text(value);
  }

  private buildWatermarkBackground(text: string): string {
    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><text x="50%" y="50%" fill="#006d5b" fill-opacity="0.11" font-size="15" font-weight="800" font-family="system-ui,sans-serif" letter-spacing="3.5" text-anchor="middle" dominant-baseline="middle" transform="rotate(-28 160 90)">${safeText}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  @HostListener('selectstart', ['$event'])
  protected blockSelection(event: Event): void {
    event.preventDefault();
  }

  @HostListener('contextmenu', ['$event'])
  protected blockContextMenu(event: Event): void {
    event.preventDefault();
  }

  @HostListener('copy', ['$event'])
  @HostListener('cut', ['$event'])
  @HostListener('paste', ['$event'])
  @HostListener('dragstart', ['$event'])
  protected blockClipboard(event: Event): void {
    event.preventDefault();
  }

  @HostListener('document:keydown', ['$event'])
  protected blockDevToolsShortcuts(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const isBlockedCombo =
      event.key === 'F12' ||
      ((event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        (key === 'i' || key === 'j' || key === 'c')) ||
      ((event.ctrlKey || event.metaKey) &&
        (key === 'u' ||
          key === 's' ||
          key === 'p' ||
          key === 'c' ||
          key === 'a'));

    if (isBlockedCombo) {
      event.preventDefault();
    }
  }
}
