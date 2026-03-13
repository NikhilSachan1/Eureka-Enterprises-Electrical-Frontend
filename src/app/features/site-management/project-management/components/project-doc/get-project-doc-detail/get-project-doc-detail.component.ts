import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { APP_CONFIG } from '@core/config';
import type { ISiteDocumentGetBaseResponseDto } from '@features/site-management/project-management/types/project.dto';

@Component({
  selector: 'app-get-project-doc-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-project-doc-detail.component.html',
  styleUrl: './get-project-doc-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectDocDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    document: ISiteDocumentGetBaseResponseDto;
  };

  protected readonly _documentDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this._documentDetails.set(this.mapDetailData(this.drawerData.document));
  }

  private mapDetailData(
    doc: ISiteDocumentGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const keys = (doc.documentKeys ?? []).filter((k): k is string => !!k);
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Document Number',
        value: doc.documentNumber ?? null,
      },
      {
        label: 'Document Type',
        value: doc.documentType ?? null,
      },
      {
        label: 'Document Date',
        value: doc.documentDate ?? null,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Due Date',
        value: doc.dueDate ?? null,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Amount',
        value: doc.amount ?? null,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'GST Amount',
        value: doc.gstAmount ?? null,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Status',
        value: doc.status ?? null,
      },
      {
        label: 'Payment Status',
        value: doc.paymentStatus ?? null,
      },
      {
        label: 'Remarks',
        value: doc.remarks ?? null,
      },
      {
        label: 'Attachment(s)',
        value: keys,
        type: EDataType.ATTACHMENTS,
      },
    ];

    const entity: IEntityViewDetails = {
      name: doc.documentNumber ?? doc.id,
      subtitle: doc.documentType ?? '',
    };

    return {
      details: [{ entryData }],
      entity,
    };
  }
}
