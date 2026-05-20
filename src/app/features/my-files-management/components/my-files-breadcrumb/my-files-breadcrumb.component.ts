import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { distinctUntilChanged, map } from 'rxjs';
import { LoggerService } from '@core/services';
import { RouterNavigationService } from '@shared/services';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { MyFilesService } from '../../services/my-files.service';
import { IMyFilesBreadcrumbItemDto } from '../../types/my-files.dto';

@Component({
  selector: 'app-my-files-breadcrumb',
  imports: [BreadcrumbModule],
  templateUrl: './my-files-breadcrumb.component.html',
  styleUrl: './my-files-breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyFilesBreadcrumbComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly myFilesService = inject(MyFilesService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected readonly breadcrumbItems = signal<MenuItem[]>([]);

  protected readonly breadcrumbHome = computed<MenuItem>(() => ({
    icon: ICONS.COMMON.HOME,
    label: 'My Files',
    command: (): void => this.navigateToFolder(null),
  }));

  ngOnInit(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => params.get('parentId')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(folderId => {
        this.loadBreadcrumbs(folderId);
      });
  }

  private loadBreadcrumbs(folderId: string | null): void {
    if (!folderId) {
      this.breadcrumbItems.set([]);
      return;
    }

    this.myFilesService
      .getMyFilesBreadcrumb(folderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          this.breadcrumbItems.set(this.mapBreadcrumbItems(response.data));
          this.logger.logUserAction('My files breadcrumb loaded successfully');
        },
        error: error => {
          this.breadcrumbItems.set([]);
          this.logger.logUserAction(
            'Failed to load my files breadcrumb',
            error
          );
        },
      });
  }

  private mapBreadcrumbItems(
    breadcrumbs: IMyFilesBreadcrumbItemDto[]
  ): MenuItem[] {
    return breadcrumbs.map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;

      return {
        label: crumb.name,
        command: isLast
          ? undefined
          : (): void => this.navigateToFolder(crumb.id),
      };
    });
  }

  private navigateToFolder(folderId: string | null): void {
    void this.routerNavigationService.navigateWithQueryParams(
      [ROUTE_BASE_PATHS.MY_FILES, ROUTES.MY_FILES.LIST],
      { parentId: folderId }
    );
  }
}
