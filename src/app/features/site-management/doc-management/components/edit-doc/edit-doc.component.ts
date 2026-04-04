import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IPageHeaderConfig } from '@shared/types';
import { IDocEditFormDto, IDocEditUIFormDto } from '../../types/doc.dto';
import { DocService } from '../../services/doc.service';
import { RouterNavigationService } from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import { EDIT_DOC_FORM_CONFIG } from '../../config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IDocDetailResolverResponse } from '../../types/doc.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-doc',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-doc.component.html',
  styleUrl: './edit-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDocComponent
  extends FormBase<IDocEditUIFormDto>
  implements OnInit
{
  private readonly docService = inject(DocService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialDocData = signal<IDocEditUIFormDto | null>(null);
  private projectId = '';

  ngOnInit(): void {
    // this.loadDocDataFromRoute();

    this.form = this.formService.createForm<IDocEditUIFormDto>(
      EDIT_DOC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialDocData(),
      }
    );
  }

  private loadDocDataFromRoute(): void {
    const docDetailFromResolver =
      this.activatedRoute.snapshot.data['docDetail'];

    if (!docDetailFromResolver) {
      this.logger.logUserAction('No doc data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.ANALYSIS,
        this.projectId,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    this.projectId = docDetailFromResolver.siteId;

    const prefilledDocData = this.preparePrefilledFormData(
      docDetailFromResolver
    );
    this.initialDocData.set(prefilledDocData);
  }

  private preparePrefilledFormData(
    docDetailFromResolver: IDocDetailResolverResponse
  ): IDocEditUIFormDto {
    const preloadedFiles = docDetailFromResolver.preloadedFiles ?? [];
    const { documentDate, documentType, documentNumber, amount, remarks } =
      docDetailFromResolver;
    return {
      documentDate: new Date(documentDate),
      documentType,
      documentNumber,
      amount: Number(amount),
      remarks,
      documentAttachments: preloadedFiles,
    };
  }

  protected override handleSubmit(): void {
    const docId = this.activatedRoute.snapshot.params['docId'] as string;
    if (!docId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditDoc(formData, docId);
  }

  private prepareFormData(): IDocEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditDoc(formData: IDocEditFormDto, docId: string): void {
    this.loadingService.show({
      title: 'Edit Doc',
      message: 'Please wait while we edit doc...',
    });
    this.form.disable();

    this.docService
      .editDoc(formData, docId)
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
          this.notificationService.success('Doc updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.PROJECT,
            ROUTES.SITE.PROJECT.ANALYSIS,
            this.projectId,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update Doc');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialDocData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Doc',
      subtitle: 'Edit a Doc',
    };
  }
}
