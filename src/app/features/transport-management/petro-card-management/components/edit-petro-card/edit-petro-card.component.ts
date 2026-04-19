import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { PetroCardService } from '../../services/petro-card.service';
import { ActivatedRoute } from '@angular/router';
import { IPageHeaderConfig } from '@shared/types';
import { EDIT_PETRO_CARD_FORM_CONFIG } from '../../config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  IPetroCardEditFormDto,
  IPetroCardGetBaseResponseDto,
} from '../../types/petro-card.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-edit-petro-card',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-petro-card.component.html',
  styleUrl: './edit-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPetroCardComponent
  extends FormBase<IPetroCardEditFormDto>
  implements OnInit
{
  private readonly petroCardService = inject(PetroCardService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialPetroCardData =
    signal<IPetroCardEditFormDto | null>(null);

  ngOnInit(): void {
    this.loadPetroCardDataFromRoute();

    this.form = this.formService.createForm(EDIT_PETRO_CARD_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialPetroCardData(),
    });
  }

  private loadPetroCardDataFromRoute(): void {
    const routeStateData =
      this.routerNavigationService.getRouterStateData<IPetroCardGetBaseResponseDto>(
        'cardData'
      );

    if (!routeStateData) {
      this.logger.logUserAction('No petro card data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.PETRO_CARD,
        ROUTES.PETRO_CARD.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledPetroCardData =
      this.preparePrefilledFormData(routeStateData);
    this.initialPetroCardData.set(prefilledPetroCardData);
  }

  private preparePrefilledFormData(
    routeStateData: IPetroCardGetBaseResponseDto
  ): IPetroCardEditFormDto {
    const { cardNumber, cardName } = routeStateData;

    return {
      petroCardNumber: cardNumber,
      petroCardName: cardName,
    };
  }

  protected override handleSubmit(): void {
    const petroCardId = this.activatedRoute.snapshot.params[
      'petroCardId'
    ] as string;
    if (!petroCardId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditPetroCard(formData, petroCardId);
  }

  private prepareFormData(): IPetroCardEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditPetroCard(
    formData: IPetroCardEditFormDto,
    petroCardId: string
  ): void {
    this.loadingService.show({
      title: 'Update Petro Card',
      message: "We're updating a petro card. This will just take a moment.",
    });
    this.form.disable();

    this.petroCardService
      .editPetroCard(formData, petroCardId)
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
          this.notificationService.success('Petro card updated successfully');
          this.appConfigurationService.refreshPetroCardDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.PETRO_CARD,
            ROUTES.PETRO_CARD.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update petro card');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialPetroCardData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Petro Card',
      subtitle: 'Edit a petro card',
    };
  }
}
