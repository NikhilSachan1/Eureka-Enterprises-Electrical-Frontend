import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterNavigationService } from '@shared/services/';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IRoleAddFormDto } from '../../types/role.dto';
import { RoleService } from '../../services/role.service';
import { ADD_ROLE_FORM_CONFIG } from '../../config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-add-role',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRoleComponent
  extends FormBase<IRoleAddFormDto>
  implements OnInit
{
  private readonly roleService = inject(RoleService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IRoleAddFormDto>(
      ADD_ROLE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddRole(formData);
  }

  private prepareFormData(): IRoleAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddRole(formData: IRoleAddFormDto): void {
    this.loadingService.show({
      title: 'Adding role',
      message: "We're adding the role. This will just take a moment.",
    });
    this.form.disable();

    this.roleService
      .addRole(formData)
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
          this.notificationService.success('Role added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add role');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Role',
      subtitle: 'Add a new role to the system',
    };
  }
}
