import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';
import { APP_PERMISSION } from '@core/constants';
import { LoggerService } from '@core/services';
import { AppPermissionService } from '@core/services/app-permission.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { COMMON_ROW_ACTIONS } from '@shared/config/common-table-actions.config';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import {
  EButtonActionType,
  EButtonVariant,
  EDataType,
  ETabLayout,
  ETabMode,
  ETabTier,
  IButtonConfig,
  IDataViewDetails,
  IPageHeaderConfig,
  ITabChange,
  ITabItem,
} from '@shared/types';
import { CONFIGURATION_ACTION_CONFIG_MAP } from '../../configs/dialog/get-configuration.config';
import { ConfigurationService } from '../../services/configuration.service';
import { ConfigurationSettingsViewComponent } from '../../shared/components/configuration-settings-view/configuration-settings-view.component';
import { summarizeConfiguration } from '../../shared/utils/config-value-display.util';
import { IConfigurationGetBaseResponseDto } from '../../types/configuration.dto';

const LIST_PAGE_SIZE = 500;
const COMPACT_MAX_WIDTH = 1023;

const ICON_BUTTON: Partial<IButtonConfig> = {
  variant: EButtonVariant.TEXT,
  rounded: true,
};

interface IModuleGroup extends ITabItem {
  configurations: IConfigurationGetBaseResponseDto[];
}

@Component({
  selector: 'app-get-configuration',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PageHeaderComponent,
    NavTabsComponent,
    ButtonComponent,
    EmptyMessagesComponent,
    ConfigurationSettingsViewComponent,
  ],
  templateUrl: './get-configuration.component.html',
  styleUrl: './get-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetConfigurationComponent {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly configurationService = inject(ConfigurationService);
  private readonly loadingService = inject(LoadingService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly icons = ICONS;
  protected readonly contentTabMode = ETabMode.CONTENT;
  protected readonly horizontalTabLayout = ETabLayout.HORIZONTAL;
  protected readonly verticalTabLayout = ETabLayout.VERTICAL;
  protected readonly secondaryTabTier = ETabTier.SECONDARY;
  protected readonly summarizeConfiguration = summarizeConfiguration;

  protected readonly configurations = signal<
    IConfigurationGetBaseResponseDto[]
  >([]);
  protected readonly isLoaded = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly selectedModule = signal('');
  protected readonly selectedConfigurationId = signal('');
  protected readonly isCompactViewport = signal(
    window.innerWidth <= COMPACT_MAX_WIDTH
  );

  protected readonly pageHeaderConfig: IPageHeaderConfig = {
    title: 'Configuration Management',
    subtitle:
      'Choose a module, pick a configuration, and inspect its live values.',
    showHeaderButton: true,
    headerButtonConfig: [
      {
        ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
        label: 'Add Configuration',
        actionName: 'addConfiguration',
        permission: [APP_PERMISSION.CONFIGURATION.ADD],
      },
    ],
  };

  protected readonly moduleTabs = computed<IModuleGroup[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const groups = new Map<string, IConfigurationGetBaseResponseDto[]>();

    this.configurations().forEach(configuration => {
      if (term && !matchesSearch(configuration, term)) {
        return;
      }
      const bucket = groups.get(configuration.module) ?? [];
      bucket.push(configuration);
      groups.set(configuration.module, bucket);
    });

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, configurations]) => ({
        route: module,
        label: module,
        badge: configurations.length,
        tooltip: `${configurations.length} configurations`,
        configurations: configurations.sort((a, b) =>
          a.label.localeCompare(b.label)
        ),
      }));
  });

  protected readonly activeGroup = computed(
    (): IModuleGroup | undefined =>
      this.moduleTabs().find(tab => tab.route === this.selectedModule()) ??
      this.moduleTabs()[0]
  );

  protected readonly configurationTabs = computed<ITabItem[]>(() =>
    (this.activeGroup()?.configurations ?? []).map(configuration => ({
      route: configuration.id,
      label: configuration.label,
      tooltip: this.summarizeConfiguration(configuration),
    }))
  );

  protected readonly selectedConfiguration = computed(() => {
    const configurations = this.activeGroup()?.configurations ?? [];
    return (
      configurations.find(
        configuration => configuration.id === this.selectedConfigurationId()
      ) ?? configurations[0]
    );
  });

  protected readonly canEdit = computed(() =>
    this.appPermissionService.hasPermission(APP_PERMISSION.CONFIGURATION.EDIT)
  );

  protected readonly canDelete = computed(() =>
    this.appPermissionService.hasPermission(APP_PERMISSION.CONFIGURATION.DELETE)
  );

  protected readonly editButtonConfig: Partial<IButtonConfig> = {
    ...COMMON_ROW_ACTIONS.EDIT,
    ...ICON_BUTTON,
    tooltip: 'Edit Configuration',
    actionName: EButtonActionType.EDIT,
  };

  protected readonly deleteButtonConfig: Partial<IButtonConfig> = {
    ...COMMON_ROW_ACTIONS.DELETE,
    ...ICON_BUTTON,
    tooltip: 'Delete Configuration',
    actionName: EButtonActionType.DELETE,
  };

  constructor() {
    this.loadConfigurationList();
  }

  @HostListener('window:resize')
  protected onViewportResize(): void {
    this.isCompactViewport.set(window.innerWidth <= COMPACT_MAX_WIDTH);
  }

  protected onModuleTabChange(change: ITabChange): void {
    this.selectedModule.set(change.tab.route);
    this.selectedConfigurationId.set('');
  }

  protected selectConfiguration(configurationId: string): void {
    this.selectedConfigurationId.set(configurationId);
  }

  protected onConfigurationAction(
    actionName: string,
    configuration: IConfigurationGetBaseResponseDto
  ): void {
    if (actionName === EButtonActionType.EDIT) {
      void this.router.navigateWithState(
        [
          ROUTE_BASE_PATHS.SETTINGS.BASE,
          ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
          ROUTES.SETTINGS.CONFIGURATION.EDIT,
          configuration.id,
        ],
        { configurationDetail: configuration }
      );
      return;
    }

    if (actionName !== EButtonActionType.DELETE) {
      return;
    }

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Module Name',
        value: configuration.module,
        type: EDataType.TEXT,
      },
      {
        label: 'Configuration Label',
        value: configuration.label,
        type: EDataType.TEXT,
      },
      {
        label: 'Description',
        value: configuration.description,
        type: EDataType.TEXT,
      },
    ];

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.DELETE,
      CONFIGURATION_ACTION_CONFIG_MAP[EButtonActionType.DELETE],
      { details: [{ entryData }] },
      false,
      true,
      {
        selectedRecord: [configuration],
        onSuccess: () => this.loadConfigurationList(),
      }
    );
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName !== 'addConfiguration') {
      return;
    }
    this.router.navigateToRoute([
      ROUTE_BASE_PATHS.SETTINGS.BASE,
      ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
      ROUTES.SETTINGS.CONFIGURATION.ADD,
    ]);
  }

  private loadConfigurationList(): void {
    this.loadingService.show({
      title: 'Loading configurations',
      message: "We're loading configurations. This will just take a moment.",
    });

    this.configurationService
      .getConfigurationList({ page: 1, pageSize: LIST_PAGE_SIZE })
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isLoaded.set(true);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ records }) => this.configurations.set(records),
        error: error => {
          this.configurations.set([]);
          this.logger.error('Failed to load configuration list', error);
        },
      });
  }
}

function matchesSearch(
  configuration: IConfigurationGetBaseResponseDto,
  term: string
): boolean {
  return [
    configuration.module,
    configuration.label,
    configuration.key,
    configuration.description,
    ...configuration.configSettings.map(setting => setting.contextKey),
  ].some(value => value?.toLowerCase().includes(term));
}
