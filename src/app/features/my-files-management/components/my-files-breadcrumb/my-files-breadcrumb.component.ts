import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs';
import { LoggerService } from '@core/services';
import { RouterNavigationService } from '@shared/services';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { MY_FILES_ROOT_LABEL } from '../../constants/my-files.constants';
import { MyFilesService } from '../../services/my-files.service';
import { IMyFilesMoveCrumb } from '../../types/my-files.interface';

/**
 * "🏠 My Files › Invoices › 2026": every part but the last opens that folder.
 * Emits the path so the page can say where uploads and new folders will go.
 */
@Component({
  selector: 'app-my-files-breadcrumb',
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

  protected readonly ICONS = ICONS;
  protected readonly rootLabel = MY_FILES_ROOT_LABEL;

  /** Folders below the top level, outermost first. */
  protected readonly crumbs = signal<IMyFilesMoveCrumb[]>([]);

  /** Full path including "My Files", whenever it changes. */
  readonly pathChange = output<IMyFilesMoveCrumb[]>();

  ngOnInit(): void {
    this.activatedRoute.queryParamMap
      .pipe(
        map(params => params.get('parentId')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(folderId => this.loadBreadcrumbs(folderId));
  }

  protected open(folderId: string | null): void {
    void this.routerNavigationService.navigateWithQueryParams(
      [ROUTE_BASE_PATHS.MY_FILES, ROUTES.MY_FILES.LIST],
      { parentId: folderId }
    );
  }

  private setCrumbs(crumbs: IMyFilesMoveCrumb[]): void {
    this.crumbs.set(crumbs);
    this.pathChange.emit([{ id: null, name: this.rootLabel }, ...crumbs]);
  }

  private loadBreadcrumbs(folderId: string | null): void {
    if (!folderId) {
      this.setCrumbs([]);
      return;
    }

    this.myFilesService
      .getMyFilesBreadcrumb(folderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response =>
          this.setCrumbs(
            response.data.map(crumb => ({ id: crumb.id, name: crumb.name }))
          ),
        error: error => {
          this.setCrumbs([]);
          this.logger.logUserAction(
            'Failed to load my files breadcrumb',
            error
          );
        },
      });
  }
}
