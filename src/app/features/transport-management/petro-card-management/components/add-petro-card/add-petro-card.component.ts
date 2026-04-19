import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { PetroCardService } from '../../services/petro-card.service';
import { ADD_PETRO_CARD_FORM_CONFIG } from '../../config';
import { IPetroCardAddFormDto } from '../../types/petro-card.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { ADD_PETRO_CARD_PREFILLED_DATA } from '@shared/mock-data/add-petro-card.mock-data';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-add-petro-card',
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    InputFieldComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-petro-card.component.html',
  styleUrl: './add-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPetroCardComponent
  extends FormBase<IPetroCardAddFormDto>
  implements OnInit
{
  private readonly petroCardService = inject(PetroCardService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IPetroCardAddFormDto>(
      ADD_PETRO_CARD_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_PETRO_CARD_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddPetroCard(formData);
  }

  private prepareFormData(): IPetroCardAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddPetroCard(formData: IPetroCardAddFormDto): void {
    this.loadingService.show({
      title: 'Adding petro card',
      message: "We're adding the petro card. This will just take a moment.",
    });
    this.form.disable();

    this.petroCardService
      .addPetroCard(formData)
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
          this.notificationService.success('Petro Card added successfully');
          this.appConfigurationService.refreshPetroCardDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.PETRO_CARD,
            ROUTES.PETRO_CARD.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add petro card');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Petro Card',
      subtitle: 'Add a new petro card',
    };
  }
}
