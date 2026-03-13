import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDIT_PROJECT_DOC_FORM_CONFIG } from '@features/site-management/project-management/config';
import { ProjectDocService } from '@features/site-management/project-management/services/project-doc.service';
import type { IEditProjectDocUIFormDto } from '@features/site-management/project-management/config/form/edit-project-doc.config';
import type { ISiteDocumentEditFormDto } from '@features/site-management/project-management/types/project.dto';
import type { IProjectDocDetailResolverResponse } from '@features/site-management/project-management/resolvers/get-project-doc-detail.resolver';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { transformDateFormat } from '@shared/utility';

@Component({
  selector: 'app-edit-project-doc',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-project-doc.component.html',
  styleUrl: './edit-project-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProjectDocComponent
  extends FormBase<IEditProjectDocUIFormDto>
  implements OnInit
{
  private readonly projectDocService = inject(ProjectDocService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly initialDocData = signal<IEditProjectDocUIFormDto | null>(
    null
  );
  private readonly resolvedDoc =
    signal<IProjectDocDetailResolverResponse | null>(null);
  /** Bump on submit so validation errors show (red border + message) */
  protected validationTrigger = signal(0);
  protected pageHeaderConfig: Partial<IPageHeaderConfig> = {
    title: 'Edit Document',
    subtitle: 'Update document details',
  };

  ngOnInit(): void {
    this.loadDocDataFromRoute();

    this.form = this.formService.createForm<IEditProjectDocUIFormDto>(
      EDIT_PROJECT_DOC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialDocData() ?? {},
      }
    );
  }

  private loadDocDataFromRoute(): void {
    const docDetail = this.activatedRoute.snapshot.data[
      'projectDocDetail'
    ] as IProjectDocDetailResolverResponse | null;

    if (!docDetail) {
      void this.routerNavigationService.navigateToRoute([
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
      ]);
      return;
    }

    this.resolvedDoc.set(docDetail);
    const prefilled = this.preparePrefilledFormData(docDetail);
    this.initialDocData.set(prefilled);
  }

  private preparePrefilledFormData(
    doc: IProjectDocDetailResolverResponse
  ): IEditProjectDocUIFormDto {
    const preloadedFiles = doc.preloadedFiles ?? [];
    return {
      totalAmount: doc.totalAmount ?? doc.amount,
      documentDate: doc.documentDate ? new Date(doc.documentDate) : undefined,
      documentNumber: doc.documentNumber,
      attachment: preloadedFiles,
    };
  }

  protected override onSubmit(): void {
    this.validationTrigger.update(v => v + 1);
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const id = this.activatedRoute.snapshot.params['id'] as string;
    if (!id) {
      return;
    }

    const formData = this.prepareEditFormData();
    this.executeEdit(formData, id);
  }

  private prepareEditFormData(): ISiteDocumentEditFormDto &
    Record<string, unknown> {
    const data = this.form.getData() as Record<string, unknown>;
    const doc = this.resolvedDoc();
    const payload: Record<string, unknown> = {
      siteId: doc?.siteId,
      documentNumber: data['documentNumber'],
      documentDate: data['documentDate']
        ? transformDateFormat(data['documentDate'] as Date)
        : undefined,
      totalAmount: data['totalAmount'],
    };

    const files = data['attachment'] as File[] | undefined;
    if (files?.length) {
      payload['attachment'] = files;
    }

    return payload as ISiteDocumentEditFormDto & Record<string, unknown>;
  }

  private executeEdit(
    formData: ISiteDocumentEditFormDto & Record<string, unknown>,
    id: string
  ): void {
    this.loadingService.show({
      title: 'Updating Document',
      message: 'Please wait...',
    });
    this.form.disable();

    this.projectDocService
      .edit(id, formData)
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
          this.notificationService.success('Document updated successfully');
          const siteId = this.resolvedDoc()?.siteId;
          const routeSegments = siteId
            ? [
                ROUTE_BASE_PATHS.SITE.BASE,
                ROUTE_BASE_PATHS.SITE.PROJECT,
                ROUTES.SITE.PROJECT.ANALYSIS,
                siteId,
              ]
            : [ROUTE_BASE_PATHS.SITE.BASE, ROUTE_BASE_PATHS.SITE.PROJECT];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update document');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialDocData() ?? {});
  }
}
