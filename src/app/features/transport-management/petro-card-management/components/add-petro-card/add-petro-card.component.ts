import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { EnvironmentService, LoggerService } from '@core/services';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { PetroCardService } from '../../services/petro-card.service';
import { ADD_PETRO_CARD_FORM_CONFIG } from '../../config';
import { IPetroCardAddRequestDto } from '../../types/petro-card.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { ADD_PETRO_CARD_PREFILLED_DATA } from '@shared/mock-data/add-petro-card.mock-data';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

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
export class AddPetroCardComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly petroCardService = inject(PetroCardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly environmentService = inject(EnvironmentService);

  protected form!: IEnhancedForm;
  protected readonly initialPetroCardData = signal<Record<
    string,
    unknown
  > | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadMockData();
    this.form = this.formService.createForm(ADD_PETRO_CARD_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialPetroCardData(),
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddPetroCard(formData);
  }

  private prepareFormData(): IPetroCardAddRequestDto {
    const { cardName, cardNumber } = this.form.getData() as {
      cardName: string;
      cardNumber: string;
    };

    return {
      cardName,
      cardNumber,
    };
  }

  private executeAddPetroCard(formData: IPetroCardAddRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Adding Petro Card',
      message: 'Please wait while we are adding the petro card...',
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Add petro card form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Petro Card Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Petro Card',
      subtitle: 'Add a new petro card',
    };
  }

  private loadMockData(): void {
    if (this.environmentService.isTestDataEnabled) {
      this.initialPetroCardData.set(ADD_PETRO_CARD_PREFILLED_DATA);
    }
  }
}
