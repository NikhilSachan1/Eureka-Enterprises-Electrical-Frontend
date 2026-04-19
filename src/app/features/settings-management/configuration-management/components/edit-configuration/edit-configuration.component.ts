import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormBase } from '@shared/base/form.base';
import {
  IConfigurationDetailGetResponseDto,
  IConfigurationEditFormDto,
  IConfigurationEditUIFormDto,
  IConfigurationGetBaseResponseDto,
} from '../../types/configuration.dto';
import { ConfigurationService } from '../../services/configuration.service';
import { RouterNavigationService } from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import {
  ADD_CONFIGURATION_VALUE_EDITOR_DEFAULT_MAX_DEPTH,
  EDIT_CONFIGURATION_FORM_CONFIG,
} from '../../configs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { AddConfigurationValueNodeComponent } from '../../shared/components/add-configuration-value-node/add-configuration-value-node.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  createEmptyNode,
  isConfigValueNodeValid,
  mapConfigurationTypeToKind,
  parseUnknownToConfigValueNode,
  serializeConfigValue,
} from '../../shared/utils/config-value.util';
import { IConfigValueNode } from '../../shared/types/config-value-node.model';

@Component({
  selector: 'app-edit-configuration',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    AddConfigurationValueNodeComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-configuration.component.html',
  styleUrl: './edit-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditConfigurationComponent
  extends FormBase<IConfigurationEditUIFormDto>
  implements OnInit
{
  private readonly configurationService = inject(ConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);

  private trackedFormFields!: ITrackedFields<IConfigurationEditUIFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly showConfigurationValueSection = computed(() => {
    const type = this.trackedFormFields?.configurationType?.() as
      | string
      | null
      | undefined;
    return type !== null && type !== undefined && String(type).trim() !== '';
  });

  /** Snapshot of the row passed via router state (used for reset + value tree). */
  protected readonly prefilledRow =
    signal<IConfigurationGetBaseResponseDto | null>(null);

  protected readonly initialConfigurationData =
    signal<IConfigurationEditUIFormDto | null>(null);

  protected readonly valueEditorMaxDepth =
    ADD_CONFIGURATION_VALUE_EDITOR_DEFAULT_MAX_DEPTH;

  protected readonly valueRoot = signal<IConfigValueNode>(
    createEmptyNode('string')
  );

  /** Bumped on each submit attempt so nested value editors show validation state. */
  protected readonly valueValidationAttempt = signal(0);

  ngOnInit(): void {
    this.loadConfigurationDataFromRoute();

    if (!this.initialConfigurationData()) {
      this.logger.warn('Edit configuration: no prefilled data in router state');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
        ROUTES.SETTINGS.CONFIGURATION.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    this.form = this.formService.createForm<IConfigurationEditUIFormDto>(
      EDIT_CONFIGURATION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialConfigurationData() ?? undefined,
      }
    );

    this.trackedFormFields =
      this.formService.trackMultipleFieldChanges<IConfigurationEditUIFormDto>(
        this.form.formGroup,
        ['configurationType'],
        this.destroyRef
      );

    const row = this.prefilledRow();
    if (row) {
      const setting =
        row.configSettings?.find(s => s.isActive) ?? row.configSettings?.[0];
      this.valueRoot.set(
        parseUnknownToConfigValueNode(setting?.value, row.valueType)
      );
    }

    this.form.formGroup
      .get('configurationType')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(type => {
        this.valueRoot.set(createEmptyNode(mapConfigurationTypeToKind(type)));
      });
  }

  private loadConfigurationDataFromRoute(): void {
    const configurationDetailFromResolver = this.activatedRoute.snapshot.data[
      'configurationDetail'
    ] as IConfigurationDetailGetResponseDto | null;

    if (!configurationDetailFromResolver) {
      this.logger.logUserAction('No configuration data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
        ROUTES.SETTINGS.CONFIGURATION.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    this.prefilledRow.set(configurationDetailFromResolver);
    this.initialConfigurationData.set(
      this.buildEditFormDefaults(configurationDetailFromResolver)
    );
  }

  private buildEditFormDefaults(
    row: IConfigurationDetailGetResponseDto
  ): IConfigurationEditUIFormDto {
    const setting =
      row.configSettings?.find(s => s.isActive) ?? row.configSettings?.[0];

    const configEffectiveDate: Date[] = [];
    if (setting?.effectiveFrom) {
      const from = new Date(setting.effectiveFrom);
      const to = setting?.effectiveTo ? new Date(setting.effectiveTo) : from;
      configEffectiveDate.push(from, to);
    }

    return {
      moduleName: row.module,
      configurationName: row.label,
      configurationType: row.valueType,
      description: row.description ?? '',
      configContextKey: setting?.contextKey ?? '',
      configEffectiveDate,
    };
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
    const configurationId = this.activatedRoute.snapshot.params[
      'configurationId'
    ] as string;
    if (!configurationId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditConfiguration(formData, configurationId);
  }

  private prepareFormData(): IConfigurationEditFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      configValue: serializeConfigValue(this.valueRoot()),
    } as IConfigurationEditFormDto;
  }

  private executeEditConfiguration(
    formData: IConfigurationEditFormDto,
    configurationId: string
  ): void {
    this.loadingService.show({
      title: 'Updating configuration',
      message: "We're updating configuration. This will just take a moment.",
    });
    this.form.disable();

    this.configurationService
      .editConfiguration(formData, configurationId)
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
          this.notificationService.success(
            'Configuration updated successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
            ROUTES.SETTINGS.CONFIGURATION.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update configuration');
        },
      });
  }

  protected onReset(): void {
    const defaults = this.initialConfigurationData();
    this.onResetSingleForm(defaults ?? {});
    const row = this.prefilledRow();
    if (row) {
      const setting =
        row.configSettings?.find(s => s.isActive) ?? row.configSettings?.[0];
      this.valueRoot.set(
        parseUnknownToConfigValueNode(setting?.value, row.valueType)
      );
    } else {
      this.valueRoot.set(createEmptyNode('string'));
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Configuration',
      subtitle: 'Edit a configuration',
    };
  }
}
