import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { PetroCardService } from '../../services/petro-card.service';
import { ActivatedRoute } from '@angular/router';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { EDIT_PETRO_CARD_FORM_CONFIG } from '../../config';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import {
  IPetroCardEditRequestDto,
  IPetroCardGetBaseResponseDto,
} from '../../types/petro-card.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

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
export class EditPetroCardComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly petroCardService = inject(PetroCardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly initialPetroCardData = signal<Record<
    string,
    unknown
  > | null>(null);

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
  ): Record<string, unknown> {
    const { cardNumber, cardName } = routeStateData;

    return {
      cardNumber,
      cardName,
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const petroCardId = this.activatedRoute.snapshot.params[
      'petroCardId'
    ] as string;
    if (!petroCardId) {
      this.logger.logUserAction('No petro card id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditPetroCard(formData, petroCardId);
  }

  private prepareFormData(): IPetroCardEditRequestDto {
    const { cardName, cardNumber } = this.form.getData() as {
      cardName: string;
      cardNumber: string;
    };

    return {
      cardName,
      cardNumber,
    };
  }

  private executeEditPetroCard(
    formData: IPetroCardEditRequestDto,
    petroCardId: string
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Edit Petro Card',
      message: 'Please wait while we edit a petro card...',
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Edit petro card form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Petro Card Form');
      this.form.reset(this.initialPetroCardData() ?? {});
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Petro Card',
      subtitle: 'Edit a petro card',
    };
  }
}
