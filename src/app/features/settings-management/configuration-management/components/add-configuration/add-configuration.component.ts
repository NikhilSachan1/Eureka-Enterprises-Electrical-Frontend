import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import {
  IConfigurationAddFormDto,
  IConfigurationAddUIFormDto,
} from '../../types/configuration.dto';
import { ConfigurationService } from '../../services/configuration.service';
import { RouterNavigationService } from '@shared/services';
import {
  ADD_CONFIGURATION_FORM_CONFIG,
  ADD_CONFIGURATION_VALUE_EDITOR_DEFAULT_MAX_DEPTH,
} from '../../configs';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { AddConfigurationValueNodeComponent } from '../../shared/components/add-configuration-value-node/add-configuration-value-node.component';
import { IConfigValueNode } from '../../shared/types/config-value-node.model';
import {
  createEmptyNode,
  isConfigValueNodeValid,
  mapConfigurationTypeToKind,
  serializeConfigValue,
} from '../../shared/utils/config-value.util';

@Component({
  selector: 'app-add-configuration',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    AddConfigurationValueNodeComponent,
  ],
  templateUrl: './add-configuration.component.html',
  styleUrl: './add-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddConfigurationComponent
  extends FormBase<IConfigurationAddUIFormDto>
  implements OnInit
{
  private readonly configurationService = inject(ConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  private trackedFormFields!: ITrackedFields<IConfigurationAddUIFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly showConfigurationValueSection = computed(() => {
    const type = this.trackedFormFields?.configurationType?.() as
      | string
      | null
      | undefined;
    return type !== null && type !== undefined && String(type).trim() !== '';
  });

  protected readonly valueEditorMaxDepth =
    ADD_CONFIGURATION_VALUE_EDITOR_DEFAULT_MAX_DEPTH;

  protected readonly valueRoot = signal<IConfigValueNode>(
    createEmptyNode('string')
  );

  /** Bumped on each submit attempt so nested value editors show validation state. */
  protected readonly valueValidationAttempt = signal(0);

  constructor() {
    super();
    effect(() => {
      if (!this.trackedFormFields?.configurationType) {
        return;
      }
      const type = this.trackedFormFields.configurationType() as string | null;
      this.valueRoot.set(createEmptyNode(mapConfigurationTypeToKind(type)));
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IConfigurationAddUIFormDto>(
      ADD_CONFIGURATION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.trackedFormFields =
      this.formService.trackMultipleFieldChanges<IConfigurationAddUIFormDto>(
        this.form.formGroup,
        ['configurationType'],
        this.destroyRef
      );
  }

  protected onValueRootChange(node: IConfigValueNode): void {
    this.valueRoot.set(node);
  }

  protected override onSubmit(): void {
    if (this.showConfigurationValueSection()) {
      this.valueValidationAttempt.update(v => v + 1);
    }
    super.onSubmit();
  }

  protected override validateForm(): boolean {
    if (!super.validateForm()) {
      return false;
    }
    if (
      this.showConfigurationValueSection() &&
      !isConfigValueNodeValid(this.valueRoot())
    ) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      return false;
    }
    return true;
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddConfiguration(formData);
  }

  private prepareFormData(): IConfigurationAddFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      configValue: serializeConfigValue(this.valueRoot()),
    };
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
    const type = this.trackedFormFields.configurationType?.() as string | null;
    this.valueRoot.set(createEmptyNode(mapConfigurationTypeToKind(type)));
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Configuration',
      subtitle: 'Add a new configuration',
    };
  }
}
