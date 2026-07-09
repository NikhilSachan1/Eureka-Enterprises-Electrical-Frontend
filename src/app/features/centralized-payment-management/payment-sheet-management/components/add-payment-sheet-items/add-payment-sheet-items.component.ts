import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { GetExpenseOutstandingComponent } from '@features/centralized-payment-management/expense-payment-management/components/get-expense-outstanding/get-expense-outstanding.component';
import { IExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/expense-payment-management/types/expense-outstanding.dto';
import { GetFuelExpenseOutstandingComponent } from '@features/centralized-payment-management/fuel-expense-payment-management/components/get-fuel-expense-outstanding/get-fuel-expense-outstanding.component';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/fuel-expense-payment-management/types/fuel-expense-outstanding.dto';
import { GetVendorOutstandingComponent } from '@features/centralized-payment-management/vendor-payment-management/components/get-vendor-outstanding/get-vendor-outstanding.component';
import { IVendorBookPaymentTableRow } from '@features/centralized-payment-management/vendor-payment-management/types/vendor-outstanding.interface';
import { PaymentOutstandingSectionComponent } from '@features/centralized-payment-management/shared/components/payment-outstanding-section/payment-outstanding-section.component';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import { getPaymentSourceTabLabel } from '@features/centralized-payment-management/shared/utils/payment-source-tab.util';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IAddPaymentSheetItemsFormDto,
  IAddPaymentSheetItemsResponseDto,
  IPaymentSheetItemDetailDto,
} from '../../types/payment-sheet.dto';
import { EPaymentSheetSourceType } from '../../types/payment-sheet.enum';
import { buildPaymentSheetItemsFromOutstanding } from '../../utils/build-payment-sheet-items.util';

@Component({
  selector: 'app-add-payment-sheet-items',
  imports: [
    PaymentOutstandingSectionComponent,
    GetExpenseOutstandingComponent,
    GetFuelExpenseOutstandingComponent,
    GetVendorOutstandingComponent,
  ],
  templateUrl: './add-payment-sheet-items.component.html',
  styleUrl: './add-payment-sheet-items.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaymentSheetItemsComponent
  implements OnInit, IDialogActionHandler
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly paymentSheetId = input.required<string>();
  protected readonly existingItems = input<IPaymentSheetItemDetailDto[]>([]);
  protected readonly onSuccess = input.required<() => void>();

  protected readonly selectedExpenseRecords = signal<
    IExpenseOutstandingGetBaseResponseDto[]
  >([]);
  protected readonly selectedFuelRecords = signal<
    IFuelExpenseOutstandingGetBaseResponseDto[]
  >([]);
  protected readonly selectedVendorBookPayments = signal<
    IVendorBookPaymentTableRow[]
  >([]);

  protected readonly activeTabIndex = model(0);

  protected readonly beneficiaryTabs = computed(() => [
    {
      value: EPaymentOutstandingSourceType.EXPENSE,
      label: getPaymentSourceTabLabel(EPaymentOutstandingSourceType.EXPENSE),
      badgeCount: this.selectedExpenseRecords().length,
    },
    {
      value: EPaymentOutstandingSourceType.FUEL_EXPENSE,
      label: getPaymentSourceTabLabel(
        EPaymentOutstandingSourceType.FUEL_EXPENSE
      ),
      badgeCount: this.selectedFuelRecords().length,
    },
    {
      value: EPaymentOutstandingSourceType.VENDOR_PAYMENT,
      label: getPaymentSourceTabLabel(
        EPaymentOutstandingSourceType.VENDOR_PAYMENT
      ),
      badgeCount: this.selectedVendorBookPayments().length,
    },
  ]);

  protected readonly excludedExpenseUserIds = computed(
    () =>
      new Set(
        this.existingItems()
          .filter(
            item =>
              item.sourceType === EPaymentSheetSourceType.EXPENSE && item.userId
          )
          .map(item => item.userId as string)
      )
  );

  protected readonly excludedFuelUserIds = computed(
    () =>
      new Set(
        this.existingItems()
          .filter(
            item =>
              item.sourceType === EPaymentSheetSourceType.FUEL_EXPENSE &&
              item.userId
          )
          .map(item => item.userId as string)
      )
  );

  protected readonly excludedBookPaymentIds = computed(
    () =>
      new Set(
        this.existingItems()
          .filter(
            item => item.sourceType === EPaymentSheetSourceType.VENDOR_PAYMENT
          )
          .flatMap(item =>
            (item.bookPaymentAllocations ?? []).map(
              allocation => allocation.bookPaymentId
            )
          )
      )
  );

  ngOnInit(): void {
    if (!this.paymentSheetId()) {
      this.confirmationDialogService.closeDialog();
    }
  }

  onDialogAccept(): void {
    const expenseRecords = this.selectedExpenseRecords();
    const fuelRecords = this.selectedFuelRecords();
    const vendorBookPayments = this.selectedVendorBookPayments();

    if (
      !expenseRecords.length &&
      !fuelRecords.length &&
      !vendorBookPayments.length
    ) {
      return;
    }

    this.executeAddPaymentSheetItemsAction({
      items: buildPaymentSheetItemsFromOutstanding(
        expenseRecords,
        fuelRecords,
        vendorBookPayments
      ),
    });
  }

  protected onExpenseSelectionChange(
    records: IExpenseOutstandingGetBaseResponseDto[]
  ): void {
    this.selectedExpenseRecords.set(records);
  }

  protected onFuelSelectionChange(
    records: IFuelExpenseOutstandingGetBaseResponseDto[]
  ): void {
    this.selectedFuelRecords.set(records);
  }

  protected onVendorSelectionChange(
    records: IVendorBookPaymentTableRow[]
  ): void {
    this.selectedVendorBookPayments.set(records);
  }

  private executeAddPaymentSheetItemsAction(
    formData: IAddPaymentSheetItemsFormDto
  ): void {
    this.loadingService.show({
      title: 'Adding beneficiaries',
      message:
        "We're adding selected beneficiaries to the payment sheet. This will just take a moment.",
    });

    this.paymentSheetService
      .addPaymentSheetItems(this.paymentSheetId(), formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddPaymentSheetItemsResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add payment sheet beneficiaries', error);
          this.notificationService.error(
            'Failed to add beneficiaries to payment sheet.'
          );
        },
      });
  }
}
