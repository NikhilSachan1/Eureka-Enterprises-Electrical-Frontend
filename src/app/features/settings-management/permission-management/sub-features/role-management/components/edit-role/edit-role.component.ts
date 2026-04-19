import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPageHeaderConfig } from '@shared/types';
import { RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import {
  IRoleEditFormDto,
  IRoleGetBaseResponseDto,
} from '../../types/role.dto';
import { EDIT_ROLE_FORM_CONFIG } from '../../config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-edit-role',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-role.component.html',
  styleUrl: './edit-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditRoleComponent
  extends FormBase<IRoleEditFormDto>
  implements OnInit
{
  private readonly roleService = inject(RoleService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialRoleData = signal<IRoleEditFormDto | null>(null);

  ngOnInit(): void {
    this.loadRoleDataFromRoute();

    this.form = this.formService.createForm<IRoleEditFormDto>(
      EDIT_ROLE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialRoleData(),
      }
    );
  }

  private loadRoleDataFromRoute(): void {
    const routeStateData =
      this.routerNavigationService.getRouterStateData<IRoleGetBaseResponseDto>(
        'roleDetail'
      );

    if (!routeStateData) {
      this.logger.logUserAction('No role data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledRoleData = this.preparePrefilledFormData(routeStateData);
    this.initialRoleData.set(prefilledRoleData);
  }

  private preparePrefilledFormData(
    routeStateData: IRoleGetBaseResponseDto
  ): IRoleEditFormDto {
    const { label, description } = routeStateData;
    return {
      roleName: label,
      roleDescription: description,
    };
  }

  protected override handleSubmit(): void {
    const roleId = this.activatedRoute.snapshot.params['roleId'] as string;
    if (!roleId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditRole(formData, roleId);
  }

  private prepareFormData(): IRoleEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditRole(formData: IRoleEditFormDto, roleId: string): void {
    this.loadingService.show({
      title: 'Updating role',
      message: "We're updating the role. This will just take a moment.",
    });
    this.form.disable();

    this.roleService
      .updateRole(formData, roleId)
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
          this.notificationService.success('Role updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update role');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialRoleData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Role',
      subtitle: 'Edit a role in the system',
    };
  }
}
