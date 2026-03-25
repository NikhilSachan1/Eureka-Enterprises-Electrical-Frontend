import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IConfigurationAddFormDto } from '../../types/configuration.dto';
import { ConfigurationService } from '../../services/configuration.service';
import { RouterNavigationService } from '@shared/services';
import { ADD_CONFIGURATION_FORM_CONFIG } from '../../configs';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-configuration',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-configuration.component.html',
  styleUrl: './add-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddConfigurationComponent
  extends FormBase<IConfigurationAddFormDto>
  implements OnInit
{
  private readonly configurationService = inject(ConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IConfigurationAddFormDto>(
      ADD_CONFIGURATION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    // this.loadMockData(ADD_CONFIGURATION_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddConfiguration(formData);
  }

  private prepareFormData(): IConfigurationAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddConfiguration(formData: IConfigurationAddFormDto): void {
    this.loadingService.show({
      title: 'Add Configuration',
      message: 'Please wait while we add configuration...',
    });
    this.form.disable();

    this.configurationService
      .addConfiguration(formData)
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
          this.notificationService.success('Configuration added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
            ROUTES.SETTINGS.CONFIGURATION.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add configuration');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Configuration',
      subtitle: 'Add a new configuration',
    };
  }
}
