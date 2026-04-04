import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FormBase } from '@shared/base/form.base';
import { IDocAddFormDto, IDocAddUIFormDto } from '../../types/doc.dto';
import { DocService } from '../../services/doc.service';
import { RouterNavigationService } from '@shared/services/router-navigation.service';
import { ADD_DOC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-doc',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-doc.component.html',
  styleUrl: './add-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDocComponent
  extends FormBase<IDocAddUIFormDto>
  implements OnInit
{
  private readonly docService = inject(DocService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  private projectId = '';

  ngOnInit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    this.projectId = projectId;

    this.form = this.formService.createForm<IDocAddUIFormDto>(
      ADD_DOC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    // this.loadMockData(ADD_DOC_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddDoc(formData);
  }

  private prepareFormData(): IDocAddFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      projectName: this.projectId,
    };
  }

  private executeAddDoc(formData: IDocAddFormDto): void {
    this.loadingService.show({
      title: 'Add Doc',
      message: 'Please wait while we add doc...',
    });
    this.form.disable();

    this.docService
      .addDoc(formData)
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
          this.notificationService.success('Doc added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.PROJECT,
            ROUTES.SITE.PROJECT.ANALYSIS,
            this.projectId,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add doc');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Doc',
      subtitle: 'Add a new doc',
    };
  }
}
