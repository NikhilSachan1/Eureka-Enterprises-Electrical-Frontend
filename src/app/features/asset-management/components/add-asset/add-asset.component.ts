import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnvironmentService, LoggerService } from '@core/services';
import { ADD_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import { IAssetAddRequestDto } from '@features/asset-management/types/asset.dto';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { ADD_ASSET_PREFILLED_DATA } from '@shared/mock-data/add-asset.mock-data';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { transformDateFormat } from '@shared/utility';
import { finalize } from 'rxjs/operators';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-add-asset',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  templateUrl: './add-asset.component.html',
  styleUrl: './add-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAssetComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly assetService = inject(AssetService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly environmentService = inject(EnvironmentService);

  protected form!: IEnhancedForm;
  protected readonly initialAssetData = signal<Record<string, unknown> | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadMockData();
    this.form = this.formService.createForm(ADD_ASSET_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialAssetData(),
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddAsset(formData);
  }

  private prepareFormData(): IAssetAddRequestDto {
    const {
      assetId,
      assetName,
      assetModel,
      assetSerialNumber,
      assetCategory,
      assetType,
      calibrationFrom,
      calibrationFrequency,
      calibrationPeriod,
      assetPurchaseDate,
      vendorName,
      warrantyPeriod,
      assetDocuments,
      remarks,
    } = this.form.getData() as {
      assetId: string;
      assetName: string;
      assetModel: string;
      assetSerialNumber: string;
      assetCategory: string;
      assetType: string;
      calibrationFrom: string;
      calibrationFrequency: string;
      calibrationPeriod: Date[];
      assetPurchaseDate: Date;
      vendorName: string;
      warrantyPeriod: Date[];
      assetDocuments: File[];
      remarks: string;
    };

    const [calibrationStartDate, calibrationEndDate] = calibrationPeriod ?? [];
    const [warrantyStartDate, warrantyEndDate] = warrantyPeriod ?? [];

    return {
      assetId,
      name: assetName,
      model: assetModel,
      serialNumber: assetSerialNumber,
      category: assetCategory,
      assetType,
      calibrationFrom,
      calibrationFrequency,
      calibrationStartDate: transformDateFormat(calibrationStartDate),
      calibrationEndDate: transformDateFormat(calibrationEndDate),
      purchaseDate: transformDateFormat(assetPurchaseDate),
      vendorName,
      warrantyStartDate: transformDateFormat(warrantyStartDate),
      warrantyEndDate: transformDateFormat(warrantyEndDate),
      remarks,
      assetFiles: assetDocuments,
    };
  }

  private executeAddAsset(formData: IAssetAddRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Add Asset',
      message: 'Please wait while we add asset...',
    });
    this.form.disable();

    this.assetService
      .addAsset(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Asset added successfully');
          const routeSegments = [ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add asset');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Add asset form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Asset Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Asset',
      subtitle: 'Add a new asset',
    };
  }

  private loadMockData(): void {
    if (this.environmentService.isTestDataEnabled) {
      this.initialAssetData.set(ADD_ASSET_PREFILLED_DATA);
    }
  }
}
