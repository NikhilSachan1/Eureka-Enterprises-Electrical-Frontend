import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ConfirmationDialogService, TableService } from '@shared/services';
import {
  EButtonActionType,
  IEnhancedTable,
  IEnhancedTableConfig,
  IDialogActionConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { DOC_ADD_BUTTON_CONFIG_MAP } from '../../config/dialog/get-doc.config';
import { EDocType } from '../../types/doc.enum';
import { DOC_TABLE_ENHANCED_CONFIG } from '../../config/table/get-doc.config';
import { IDocGetBaseResponseDto } from '../../types/doc.dto';

@Component({
  selector: 'app-get-doc',
  imports: [DataTableComponent, DialogModule, SplitButtonModule],
  templateUrl: './get-doc.component.html',
  styleUrl: './get-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDocComponent implements OnInit {
  private readonly dataTableService = inject(TableService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  readonly docContext = input<'sales' | 'purchase'>('sales');

  protected table!: IEnhancedTable;
  protected addDocumentSplitItems: MenuItem[] = [];

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      DOC_TABLE_ENHANCED_CONFIG as unknown as IEnhancedTableConfig
    );

    if (this.docContext() === 'purchase') {
      const updatedHeaders = this.table
        .getHeaders()
        .map((header, index) =>
          index === 0 ? { ...header, header: 'Vendor Name' } : header
        );
      this.table.updateHeaders(updatedHeaders);
    }

    this.initializeSplitButtonItems();
  }

  protected handleDocTableActionClick(
    event: ITableActionClickEvent<IDocGetBaseResponseDto>
  ): void {
    console.warn(event);
  }

  protected openAddDocDialog(dialogType: EDocType): void {
    const dialogConfig: IDialogActionConfig = {
      ...DOC_ADD_BUTTON_CONFIG_MAP[dialogType],
    };
    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: [],
    };

    if (dialogType === EDocType.PO) {
      dynamicComponentInputs['docContext'] = this.docContext();
    }
    if (dialogType === EDocType.PAYMENT_ADVICE) {
      dynamicComponentInputs['docContext'] = this.docContext();
      if (this.docContext() === 'purchase') {
        dialogConfig.dialogConfig = {
          ...dialogConfig.dialogConfig,
          header: 'Generate Payment Advice',
          message: 'Fill and generate the payment advice details.',
        };
      }
    }

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.SUBMIT,
      dialogConfig,
      null,
      false,
      false,
      dynamicComponentInputs
    );
  }

  protected onAddDocumentPrimaryClick(): void {
    this.openAddDocDialog(EDocType.PO);
  }

  private initializeSplitButtonItems(): void {
    const items: MenuItem[] = [
      {
        label: 'Add PO',
        command: (): void => this.openAddDocDialog(EDocType.PO),
      },
      {
        label: 'Add JMC',
        command: (): void => this.openAddDocDialog(EDocType.JMC),
      },
      {
        label: 'Add Report',
        command: (): void => this.openAddDocDialog(EDocType.REPORT),
      },
      {
        label: 'Add Invoice',
        command: (): void => this.openAddDocDialog(EDocType.INVOICE),
      },
      {
        label: 'Add Payment',
        command: (): void => this.openAddDocDialog(EDocType.PAYMENT),
      },
    ];

    const paymentAdviceLabel =
      this.docContext() === 'purchase'
        ? 'Generate Payment Advice'
        : 'Add Payment Advice';
    items.push({
      label: paymentAdviceLabel,
      command: (): void => this.openAddDocDialog(EDocType.PAYMENT_ADVICE),
    });

    this.addDocumentSplitItems = items;
  }

  protected addDocumentButtonLabel(): string | null {
    const currentContext = this.docContext();

    if (currentContext === 'sales') {
      return 'Add Sales Document';
    } else if (currentContext === 'purchase') {
      return 'Add Purchase Document';
    }

    return 'Add Document';
  }
}
