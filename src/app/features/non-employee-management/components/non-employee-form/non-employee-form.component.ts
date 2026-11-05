import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormBase } from '@shared/base/form.base';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { finalize, Observable } from 'rxjs';
import {
  ADD_NON_EMPLOYEE_FORM_CONFIG,
  EDIT_NON_EMPLOYEE_FORM_CONFIG,
} from '../../configs/form/non-employee-form.config';
import { NON_EMPLOYEE_TAB_QUERY_PARAMS } from '../../constants/non-employee.constants';
import { INonEmployeeAddFormDto } from '../../schemas/non-employee.schema';
import { NonEmployeeService } from '../../services/non-employee.service';
import { INonEmployeeDetailResolverResponse } from '../../resolvers/get-non-employee-detail.resolver';

/** Add and edit form. The edit route supplies `nonEmployeeDetail` through its resolver. */
@Component({
  selector: 'app-non-employee-form',
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    InputFieldComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './non-employee-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonEmployeeFormComponent
  extends FormBase<INonEmployeeAddFormDto>
  implements OnInit
{
  private readonly nonEmployeeService = inject(NonEmployeeService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly detail = this.activatedRoute.snapshot.data[
    'nonEmployeeDetail'
  ] as INonEmployeeDetailResolverResponse | undefined;
  protected readonly isEdit = !!this.detail;
  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() => ({
    title: this.isEdit ? 'Edit Non Employee' : 'Add Non Employee',
    subtitle: 'Login access with basic details only',
  }));

  ngOnInit(): void {
    const defaultValues = this.detail
      ? ({
          firstName: this.detail.firstName,
          lastName: this.detail.lastName,
          email: this.detail.email,
          contactNumber: this.detail.contactNumber ?? '',
          profilePicture: this.detail.preloadedPicture,
        } as unknown as INonEmployeeAddFormDto)
      : undefined;

    this.form = this.formService.createForm<INonEmployeeAddFormDto>(
      this.isEdit
        ? (EDIT_NON_EMPLOYEE_FORM_CONFIG as never)
        : ADD_NON_EMPLOYEE_FORM_CONFIG,
      { destroyRef: this.destroyRef, defaultValues }
    );
  }

  protected override handleSubmit(): void {
    const formData = this.form.getData();
    const request$: Observable<unknown> = this.detail
      ? this.nonEmployeeService.editNonEmployee(formData, this.detail.id)
      : this.nonEmployeeService.addNonEmployee(formData);

    this.loadingService.show({
      title: this.isEdit ? 'Updating non employee' : 'Adding non employee',
      message: 'This will just take a moment.',
    });
    this.form.disable();

    request$
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
          this.notificationService.success(
            this.isEdit
              ? 'Non employee updated successfully'
              : 'Non employee added. Login details have been sent by email.'
          );
          void this.routerNavigationService.navigateWithQueryParams(
            [ROUTE_BASE_PATHS.EMPLOYEE, ROUTES.EMPLOYEE.LIST],
            NON_EMPLOYEE_TAB_QUERY_PARAMS
          );
        },
        // ApiService already shows the reason returned by the backend.
        error: error => this.logger.error('Failed to save non employee', error),
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }
}
