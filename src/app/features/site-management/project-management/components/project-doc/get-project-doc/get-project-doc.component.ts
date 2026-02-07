import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICONS } from '@shared/constants';

interface ProjectDocument {
  id: string;
  documentNumber: string;
  documentName: string;
  type: 'PO' | 'INVOICE' | 'QUOTATION' | 'CONTRACT';
  date: string;
  amount: number;
  gst: number;
}

@Component({
  selector: 'app-get-project-doc',
  imports: [CommonModule],
  templateUrl: './get-project-doc.component.html',
  styleUrl: './get-project-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectDocComponent {
  protected icons = ICONS;

  documents: ProjectDocument[] = [
    {
      id: '1',
      documentNumber: 'PO-2026-001',
      documentName: 'Purchase Order - Electrical Equipment',
      type: 'PO',
      date: 'Jan 5, 2026',
      amount: 5000000,
      gst: 763000,
    },
    {
      id: '2',
      documentNumber: 'INV-2026-001',
      documentName: 'Invoice - Material Supply',
      type: 'INVOICE',
      date: 'Jan 15, 2026',
      amount: 2500000,
      gst: 381000,
    },
    {
      id: '3',
      documentNumber: 'INV-2026-002',
      documentName: 'Invoice - Installation Services',
      type: 'INVOICE',
      date: 'Jan 18, 2026',
      amount: 1000000,
      gst: 153000,
    },
    {
      id: '4',
      documentNumber: 'QUO-2026-001',
      documentName: 'Quotation - Panel Board',
      type: 'QUOTATION',
      date: 'Dec 28, 2025',
      amount: 750000,
      gst: 114750,
    },
  ];

  formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  getDocumentIcon(type: string): string {
    const iconMap: Record<string, string> = {
      PO: this.icons.COMMON.BRIEFCASE,
      INVOICE: this.icons.MEDIA.PDF,
      QUOTATION: this.icons.COMMON.FILE,
      CONTRACT: this.icons.MEDIA.DOCUMENT,
    };
    return iconMap[type] || this.icons.COMMON.FILE;
  }

  getDocumentColor(type: string): string {
    const colorMap: Record<string, string> = {
      PO: '#3b82f6', // Blue
      INVOICE: '#10b981', // Green
      QUOTATION: '#f59e0b', // Amber
      CONTRACT: '#8b5cf6', // Purple
    };
    return colorMap[type] || '#6b7280';
  }

  onViewDocument(_doc: ProjectDocument): void {
    // console.log('View document:', doc);
  }

  onEditDocument(_doc: ProjectDocument): void {
    // console.log('Edit document:', doc);
  }

  onDownloadDocument(_doc: ProjectDocument): void {
    // console.log('Download document:', doc);
  }

  onDeleteDocument(_doc: ProjectDocument): void {
    // console.log('Delete document:', doc);
  }
}
