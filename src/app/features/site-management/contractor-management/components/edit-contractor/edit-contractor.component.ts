import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { ContractorService } from '../../services/contractor.service';
import { RouterNavigationService } from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import {
  IContractorDetailGetResponseDto,
  IContractorEditFormDto,
} from '../../types/contractor.dto';
import { EDIT_CONTRACTOR_FORM_CONFIG } from '../../config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-contractor',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-contractor.component.html',
  styleUrl: './edit-contractor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditContractorComponent
  extends FormBase<IContractorEditFormDto>
  implements OnInit
{
  private readonly contractorService = inject(ContractorService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialContractorData =
    signal<IContractorEditFormDto | null>(null);

  ngOnInit(): void {
    this.loadContractorDataFromRoute();

    this.form = this.formService.createForm<IContractorEditFormDto>(
      EDIT_CONTRACTOR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialContractorData(),
      }
    );
  }

  private loadContractorDataFromRoute(): void {
    const contractorDetailFromResolver = this.activatedRoute.snapshot.data[
      'contractorDetail'
    ] as IContractorDetailGetResponseDto;

    if (!contractorDetailFromResolver) {
      this.logger.logUserAction('No contractor data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.CONTRACTOR,
        ROUTES.SITE.CONTRACTOR.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledContractorData = this.preparePrefilledFormData(
      contractorDetailFromResolver
    );
    this.initialContractorData.set(prefilledContractorData);
  }

  private preparePrefilledFormData(
    contractorDetailFromResolver: IContractorDetailGetResponseDto
  ): IContractorEditFormDto {
    const {
      name,
      contactNumber,
      email,
      gstNumber,
      blockNumber,
      streetName,
      landmark,
      state,
      city,
      pincode,
    } = contractorDetailFromResolver;

    return {
      contractorName: name,
      contactNumber: Number(contactNumber),
      emailAddress: email,
      contractorGSTNumber: gstNumber,
      blockNumber,
      streetName,
      landmark,
      state,
      city,
      pincode: Number(pincode),
    };
  }

  protected override handleSubmit(): void {
    const contractorId = this.activatedRoute.snapshot.params[
      'contractorId'
    ] as string;
    if (!contractorId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditContractor(formData, contractorId);
  }

  private prepareFormData(): IContractorEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditContractor(
    formData: IContractorEditFormDto,
    contractorId: string
  ): void {
    this.loadingService.show({
      title: 'Edit Contractor',
      message: 'Please wait while we edit contractor...',
    });
    this.form.disable();

    this.contractorService
      .editContractor(formData, contractorId)
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
          this.notificationService.success('Contractor updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.CONTRACTOR,
            ROUTES.SITE.CONTRACTOR.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update contractor');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialContractorData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Contractor',
      subtitle: 'Edit a contractor',
    };
  }
}
