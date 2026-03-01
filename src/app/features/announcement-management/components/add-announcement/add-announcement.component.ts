import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ADD_ANNOUNCEMENT_FORM_CONFIG } from '@features/announcement-management/config';
import { AnnouncementService } from '@features/announcement-management/services/announcement.service';
import { IAnnouncementAddFormDto } from '@features/announcement-management/types/announcement.dto';
import { FormBase } from '@shared/base/form.base';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AnnouncementContentPreviewComponent } from '../announcement-content-preview/announcement-content-preview.component';

@Component({
  selector: 'app-add-announcement',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    AnnouncementContentPreviewComponent,
  ],
  templateUrl: './add-announcement.component.html',
  styleUrl: './add-announcement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAnnouncementComponent
  extends FormBase<IAnnouncementAddFormDto>
  implements OnInit
{
  private readonly announcementService = inject(AnnouncementService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected contentPreview!: Signal<string>;

  ngOnInit(): void {
    this.form = this.formService.createForm<IAnnouncementAddFormDto>(
      ADD_ANNOUNCEMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
    this.contentPreview = this.formService.trackFieldChanges<string>(
      this.form.formGroup,
      'content',
      this.destroyRef
    );
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddAnnouncement(formData);
  }

  private prepareFormData(): IAnnouncementAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddAnnouncement(formData: IAnnouncementAddFormDto): void {
    this.loadingService.show({
      title: 'Add Announcement',
      message: 'Please wait while we add announcement...',
    });
    this.form.disable();

    this.announcementService
      .addAnnouncement(formData)
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
          this.notificationService.success('Announcement added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.ANNOUNCEMENT,
            ROUTES.ANNOUNCEMENT.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add announcement');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Announcement',
      subtitle: 'Add a new announcement',
    };
  }
}
