import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { BankDetailsCellComponent } from '@shared/components/bank-details-cell/bank-details-cell.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService } from '@shared/services';
import {
  EBankDetailsDisplayMode,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
} from '@shared/types';
import {
  getMappedValueFromArrayOfObjects,
  mapPaidFromAccountToBankDetails,
} from '@shared/utility';
import { IWalletRechargeGetBaseResponseDto } from '../../types/petro-card-wallet.dto';
import { isWalletRechargePaymentRecorded } from '../../utils/wallet-recharge-payment.util';

@Component({
  selector: 'app-get-wallet-recharge-detail',
  imports: [ViewDetailComponent, BankDetailsCellComponent, StatusTagComponent],
  templateUrl: './get-wallet-recharge-detail.component.html',
  styleUrl: './get-wallet-recharge-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetWalletRechargeDetailComponent extends DrawerDetailBase {
  protected readonly EBankDetailsDisplayMode = EBankDetailsDisplayMode;

  protected readonly drawerData = inject(DRAWER_DATA) as {
    recharge: IWalletRechargeGetBaseResponseDto;
  };
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _rechargeDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this._rechargeDetails.set(this.mapDetailData(this.drawerData.recharge));
  }

  private mapDetailData(
    record: IWalletRechargeGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const isPaid = isWalletRechargePaymentRecorded(record);
    const paymentModeLabel = record.paymentMode
      ? getMappedValueFromArrayOfObjects(
          this.appConfigurationService.expensePaymentMethods(),
          record.paymentMode
        )
      : null;

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Date',
        value: record.rechargeDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Amount',
        value: record.amount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Payment',
        value: {
          isPaid,
          referenceNumber: record.referenceNumber?.trim() || null,
          paymentModeLabel,
          paidFromAccount: record.paidFromAccount
            ? mapPaidFromAccountToBankDetails(record.paidFromAccount)
            : null,
        },
        customTemplateKey: 'paymentDetails',
        detailTemplateFullRow: true,
        detailTemplatePlain: true,
      },
    ];

    return {
      details: [
        {
          entryData,
          createdBy: {
            user: record.createdByUser,
            date: record.createdAt,
            notes: record.remarks ?? undefined,
          },
        },
      ],
    };
  }
}
