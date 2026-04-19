import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EDIT_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import { IAssetEditFormDto } from '@features/asset-management/types/asset.dto';
import { EAssetType } from '@features/asset-management/types/asset.enum';
import { IAssetDetailResolverResponse } from '@features/asset-management/types/asset.interface';
import { FormBase } from '@shared/base/form.base';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
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
export class EditAssetComponent
  extends FormBase<IAssetEditFormDto>
  implements OnInit
{
  private readonly assetService = inject(AssetService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialAssetData = signal<IAssetEditFormDto | null>(null);

  private assetTypeTracked!: Signal<string | null | undefined>;

  /** Hidden only for non-calibrated; shown when unset (default) or calibrated. */
  protected readonly showCalibrationDetails = computed(
    () => this.assetTypeTracked() !== EAssetType.NON_CALIBRATED
  );

  ngOnInit(): void {
    this.loadAssetDataFromRoute();

    this.form = this.formService.createForm<IAssetEditFormDto>(
      EDIT_ASSET_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialAssetData(),
      }
    );

    this.assetTypeTracked = this.formService.trackFieldChanges(
      this.form.formGroup,
      'assetType',
      this.destroyRef
    );
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
  ): IAssetEditFormDto {
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
      assetCalibrationFrom: calibrationFrom,
      assetCalibrationFrequency: calibrationFrequency,
      assetCalibrationDate:
        calibrationStartDate && calibrationEndDate
          ? [new Date(calibrationStartDate), new Date(calibrationEndDate)]
          : null,
      assetPurchaseDate: new Date(purchaseDate),
      assetVendorName: vendorName,
      assetWarrantyDate:
        warrantyStartDate && warrantyEndDate
          ? [new Date(warrantyStartDate), new Date(warrantyEndDate)]
          : null,
      remarks,
      assetFiles: preloadedFiles,
    };
  }

  protected override handleSubmit(): void {
    const assetId = this.activatedRoute.snapshot.params['assetId'] as string;
    if (!assetId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditAsset(formData, assetId);
  }

  private prepareFormData(): IAssetEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditAsset(formData: IAssetEditFormDto, assetId: string): void {
    this.loadingService.show({
      title: 'Updating asset',
      message: "We're updating your changes. This will just take a moment.",
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
          this.appConfigurationService.refreshAssetDropdowns();
          const routeSegments = [ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update asset');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialAssetData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Update Asset',
      subtitle: 'Update an asset',
    };
  }
}
