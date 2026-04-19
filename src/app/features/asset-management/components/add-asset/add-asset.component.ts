import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ADD_ASSET_FORM_CONFIG } from '@features/asset-management/config';
import { AssetService } from '@features/asset-management/services/asset.service';
import { EAssetType } from '@features/asset-management/types/asset.enum';
import { IAssetAddFormDto } from '@features/asset-management/types/asset.dto';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { ADD_ASSET_PREFILLED_DATA } from '@shared/mock-data/add-asset.mock-data';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs/operators';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FormBase } from '@shared/base/form.base';

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
export class AddAssetComponent
  extends FormBase<IAssetAddFormDto>
  implements OnInit
{
  private readonly assetService = inject(AssetService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private assetTypeTracked!: Signal<string | null | undefined>;

  /** Hidden only for non-calibrated; shown when unset (default) or calibrated. */
  protected readonly showCalibrationDetails = computed(
    () => this.assetTypeTracked() !== EAssetType.NON_CALIBRATED
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IAssetAddFormDto>(
      ADD_ASSET_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.assetTypeTracked = this.formService.trackFieldChanges(
      this.form.formGroup,
      'assetType',
      this.destroyRef
    );

    this.loadMockData(ADD_ASSET_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddAsset(formData);
  }

  private prepareFormData(): IAssetAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddAsset(formData: IAssetAddFormDto): void {
    this.loadingService.show({
      title: 'Adding new asset',
      message: "We're adding your new asset. This will just take a moment.",
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
          this.appConfigurationService.refreshAssetDropdowns();
          const routeSegments = [ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add asset');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Asset',
      subtitle: 'Add a new asset',
    };
  }
}
