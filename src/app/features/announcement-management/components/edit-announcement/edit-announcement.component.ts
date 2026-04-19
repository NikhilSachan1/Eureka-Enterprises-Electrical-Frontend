import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDIT_ANNOUNCEMENT_FORM_CONFIG } from '@features/announcement-management/config';
import { AnnouncementService } from '@features/announcement-management/services/announcement.service';
import {
  IAnnouncementDetailGetResponseDto,
  IAnnouncementEditFormDto,
} from '@features/announcement-management/types/announcement.dto';
import { FormBase } from '@shared/base/form.base';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AnnouncementContentPreviewComponent } from '../announcement-content-preview/announcement-content-preview.component';

@Component({
  selector: 'app-edit-announcement',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    AnnouncementContentPreviewComponent,
  ],
  templateUrl: './edit-announcement.component.html',
  styleUrl: './edit-announcement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAnnouncementComponent
  extends FormBase<IAnnouncementEditFormDto>
  implements OnInit
{
  private readonly announcementService = inject(AnnouncementService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialAnnouncementData =
    signal<IAnnouncementEditFormDto | null>(null);
  protected contentPreview!: Signal<string>;

  ngOnInit(): void {
    this.loadAnnouncementDataFromRoute();

    this.form = this.formService.createForm<IAnnouncementEditFormDto>(
      EDIT_ANNOUNCEMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialAnnouncementData(),
      }
    );
    this.contentPreview = this.formService.trackFieldChanges<string>(
      this.form.formGroup,
      'content',
      this.destroyRef
    );
  }

  private loadAnnouncementDataFromRoute(): void {
    const announcementDetailFromResolver = this.activatedRoute.snapshot.data[
      'announcementDetail'
    ] as IAnnouncementDetailGetResponseDto;

    if (!announcementDetailFromResolver) {
      this.logger.logUserAction('No announcement data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.ANNOUNCEMENT,
        ROUTES.ANNOUNCEMENT.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledAnnouncementData = this.preparePrefilledFormData(
      announcementDetailFromResolver
    );
    this.initialAnnouncementData.set(prefilledAnnouncementData);
  }

  private preparePrefilledFormData(
    announcementDetailFromResolver: IAnnouncementDetailGetResponseDto
  ): IAnnouncementEditFormDto {
    const { title, message, startAt, expiryAt, targets } =
      announcementDetailFromResolver;

    return {
      title,
      content: message,
      announcementDate: [new Date(startAt), new Date(expiryAt)],
      announcementSentTo: targets.map(target => target.targetId),
    };
  }

  protected override handleSubmit(): void {
    const announcementId = this.activatedRoute.snapshot.params[
      'announcementId'
    ] as string;
    if (!announcementId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditAnnouncement(formData, announcementId);
  }

  private prepareFormData(): IAnnouncementEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditAnnouncement(
    formData: IAnnouncementEditFormDto,
    announcementId: string
  ): void {
    this.loadingService.show({
      title: 'Update Announcement',
      message: "We're updating announcement. This will just take a moment.",
    });
    this.form.disable();

    this.announcementService
      .editAnnouncement(formData, announcementId)
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
          this.notificationService.success('Announcement updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.ANNOUNCEMENT,
            ROUTES.ANNOUNCEMENT.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update announcement');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialAnnouncementData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Update Announcement',
      subtitle: 'Update an announcement',
    };
  }
}
