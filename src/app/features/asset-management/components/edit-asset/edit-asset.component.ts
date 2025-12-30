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
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services/logger.service';
import { EDIT_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import { IAssetEditRequestDto } from '@features/asset-management/types/asset.dto';
import { IAssetDetailResolverResponse } from '@features/asset-management/types/asset.interface';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { transformDateFormat } from '@shared/utility';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-edit-asset',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-asset.component.html',
  styleUrl: './edit-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAssetComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly assetService = inject(AssetService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly initialAssetData = signal<Record<string, unknown> | null>(
    null
  );

  ngOnInit(): void {
    this.loadAssetDataFromRoute();
    this.form = this.formService.createForm(EDIT_ASSET_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialAssetData(),
    });
  }

  private loadAssetDataFromRoute(): void {
    const assetDetailFromResolver = this.activatedRoute.snapshot.data[
      'assetDetail'
    ] as IAssetDetailResolverResponse | null;

    if (!assetDetailFromResolver) {
      this.logger.logUserAction('No asset data found in route');
      const routeSegments = [ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledAssetData = this.preparePrefilledFormData(
      assetDetailFromResolver
    );
    this.initialAssetData.set(prefilledAssetData);
  }

  private preparePrefilledFormData(
    assetDetailFromResolver: IAssetDetailResolverResponse
  ): Record<string, unknown> {
    const preloadedFiles = assetDetailFromResolver.preloadedFiles ?? [];

    const {
      assetId,
      assetType,
      name,
      model,
      serialNumber,
      category,
      calibrationFrom,
      calibrationFrequency,
      calibrationStartDate,
      calibrationEndDate,
      purchaseDate,
      vendorName,
      warrantyStartDate,
      warrantyEndDate,
      remarks,
    } = assetDetailFromResolver;

    return {
      assetId,
      assetType,
      assetName: name,
      assetModel: model,
      assetSerialNumber: serialNumber,
      assetCategory: category,
      calibrationFrom,
      calibrationFrequency,
      calibrationPeriod: [
        new Date(calibrationStartDate),
        new Date(calibrationEndDate),
      ],
      assetPurchaseDate: new Date(purchaseDate),
      vendorName,
      warrantyPeriod: [new Date(warrantyStartDate), new Date(warrantyEndDate)],
      remarks,
      assetDocuments: preloadedFiles,
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const assetId = this.activatedRoute.snapshot.params['assetId'] as string;
    if (!assetId) {
      this.logger.logUserAction('No asset id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditAsset(formData, assetId);
  }

  private prepareFormData(): IAssetEditRequestDto {
    const {
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

  private executeEditAsset(
    formData: IAssetEditRequestDto,
    assetId: string
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Edit Asset',
      message: 'Please wait while we edit asset...',
    });
    this.form.disable();

    this.assetService
      .editAsset(formData, assetId)
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
          this.notificationService.success('Asset updated successfully');
          const routeSegments = [ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update asset');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Edit asset form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Asset Form');
      this.form.reset(this.initialAssetData() ?? {});
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Asset',
      subtitle: 'Edit an asset',
    };
  }
}
