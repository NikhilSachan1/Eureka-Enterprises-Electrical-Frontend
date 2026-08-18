import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import type { IDocWorkspaceContextView } from '@features/site-management/doc-management/shared/types/doc-workspace-context.interface';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import {
  EMPTY_PROJECT_DOCUMENT_STATUS,
  IProjectDocumentStatusTarget,
} from '../../types/project-document-status.interface';
import { ProjectWorkspaceDocumentStatusService } from '../../services/project-workspace-document-status.service';
import {
  buildScopedBreakdownSnapshot,
  resolveScopedParentPoId,
  TWorkspaceDocStatusScope,
} from '../../utility/workspace-document-status-row.util';
import { buildWorkspaceDetailProjectTarget } from '../../utility/workspace-table-document-status.util';
import { ProjectDocumentStatusComponent } from '../project-document-status/project-document-status.component';
import { ProjectDocumentStatusDetailComponent } from '../project-document-status-detail/project-document-status-detail.component';

@Component({
  selector: 'app-workspace-document-status-cell',
  imports: [ProjectDocumentStatusComponent, ProjectDocumentStatusDetailComponent],
  templateUrl: './workspace-document-status-cell.component.html',
  styleUrl: './workspace-document-status-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDocumentStatusCellComponent {
  protected readonly workspaceDocumentStatus = inject(
    ProjectWorkspaceDocumentStatusService,
    { optional: true }
  );

  readonly recordId = input.required<string>();
  readonly scope = input.required<TWorkspaceDocStatusScope>();
  readonly docContext = input<EDocContext | undefined>(undefined);
  readonly workspaceContext = input<IDocWorkspaceContextView | null>(null);

  protected readonly detailVisible = signal(false);

  protected readonly rowBinding = computed(() => {
    const service = this.workspaceDocumentStatus;
    const docContext = this.docContext();

    if (!service || !docContext) {
      return null;
    }

    service.tableBreakdownTick();

    return {
      service,
      docContext,
      recordId: this.recordId(),
      scope: this.scope(),
      snapshot: service.snapshotForDetail(),
    };
  });

  protected readonly loading = computed(() => {
    const row = this.rowBinding();
    if (!row) {
      return false;
    }

    return (
      row.service.tableBreakdownLoading() ||
      row.service.breakdown().loading ||
      (row.service.hasProjectContext() && !this.breakdownReady())
    );
  });

  protected readonly breakdownReady = computed(() => {
    const row = this.rowBinding();
    if (!row) {
      return false;
    }

    return (
      row.service.hasRowStatus(row.recordId, row.scope, row.docContext) ||
      (!row.service.breakdown().loading && !!row.snapshot)
    );
  });

  protected readonly status = computed(() => {
    const row = this.rowBinding();
    if (!row) {
      return EMPTY_PROJECT_DOCUMENT_STATUS;
    }

    return row.service.resolveRowStatus(
      row.recordId,
      row.scope,
      row.docContext
    );
  });

  protected readonly metricContext = computed(() => {
    const docContext = this.docContext();
    if (docContext === EDocContext.SALES) {
      return 'sales' as const;
    }
    if (docContext === EDocContext.PURCHASE) {
      return 'purchase' as const;
    }
    return null;
  });

  protected readonly detailProject = computed((): IProjectDocumentStatusTarget | null => {
    const row = this.rowBinding();
    const ctx = this.workspaceContext();
    const fallback = row?.service.documentTarget() ?? null;

    if (!ctx?.projectName || !row?.docContext) {
      return fallback;
    }

    return buildWorkspaceDetailProjectTarget(
      ctx,
      row.docContext,
      fallback
    );
  });

  protected readonly scopedBreakdownSnapshot = computed(() => {
    const row = this.rowBinding();
    if (!row?.snapshot) {
      return null;
    }

    return buildScopedBreakdownSnapshot(
      row.snapshot,
      row.scope,
      row.recordId,
      row.docContext
    );
  });

  protected readonly autoExpandPoId = computed(() => {
    const row = this.rowBinding();
    if (!row?.snapshot) {
      return null;
    }

    return resolveScopedParentPoId(
      row.snapshot,
      row.scope,
      row.recordId,
      row.docContext
    );
  });

  protected readonly canOpenDetail = computed(
    () =>
      !!this.rowBinding() &&
      this.breakdownReady() &&
      !!this.scopedBreakdownSnapshot() &&
      !!this.detailProject()
  );

  protected onViewDetails(): void {
    if (!this.canOpenDetail()) {
      return;
    }

    this.detailVisible.set(true);
  }

  protected onDetailVisibleChange(visible: boolean): void {
    this.detailVisible.set(visible);
  }
}
