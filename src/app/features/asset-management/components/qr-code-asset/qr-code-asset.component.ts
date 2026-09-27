import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChildren,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { IAssetGetBaseResponseDto } from '@features/asset-management/types/asset.dto';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import {
  ConfirmationDialogService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { QRCodeComponent } from 'angularx-qrcode';

const QR_SIZE = 260;
const EXPORT_PADDING = 16;
const BRAND_COLOR = '#006d5b';
const CANVAS_WAIT_MS = 8000;

interface IPrintableAssetQr {
  id: string;
  name: string;
  assetId: string;
  qrData: string;
}

@Component({
  selector: 'app-qr-code-asset',
  imports: [QRCodeComponent],
  templateUrl: './qr-code-asset.component.html',
  styleUrl: './qr-code-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeAssetComponent implements IDialogActionHandler {
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly notificationService = inject(NotificationService);

  private readonly plateRefs =
    viewChildren<ElementRef<HTMLElement>>('qrPlate');

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();
  protected readonly printOnAccept = input(false);

  protected readonly companyName = APP_CONFIG.name;
  protected readonly logoPath = APP_CONFIG.logoPath;
  protected readonly qrWidth = QR_SIZE;

  protected readonly printableAssets = computed<IPrintableAssetQr[]>(() => {
    const origin = window.location.origin;
    return (this.selectedRecord() ?? [])
      .filter((asset): asset is IAssetGetBaseResponseDto & { id: string } =>
        Boolean(asset?.id)
      )
      .map(asset => ({
        id: asset.id,
        name: asset.name?.trim() || 'Asset',
        assetId: asset.assetId?.trim() || '',
        qrData: `${origin}/${ROUTE_BASE_PATHS.PUBLIC}/${ROUTE_BASE_PATHS.ASSET}/${asset.id}`,
      }));
  });

  protected readonly isBulkPreview = computed(
    () => this.printableAssets().length > 1
  );

  protected readonly asset = computed(
    () => this.printableAssets()[0] ?? null
  );

  async onDialogAccept(): Promise<void> {
    if (this.printOnAccept()) {
      await this.printQrSheet();
      return;
    }
    await this.downloadCompositeImage();
  }

  onDialogReject(): void {
    this.confirmationDialogService.closeDialog();
  }

  private async printQrSheet(): Promise<void> {
    const expected = this.printableAssets().length;
    if (expected === 0) {
      this.notificationService.error(
        'Unable to generate QR codes for the selected assets.'
      );
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.notificationService.warning(
        'Allow pop-ups to print QR labels, then try again.'
      );
      return;
    }

    printWindow.document.write(
      '<!DOCTYPE html><html><head><title>Preparing QR labels…</title></head><body>Preparing QR labels…</body></html>'
    );

    const canvases = await this.waitForQrCanvases(expected);
    if (canvases.length === 0) {
      printWindow.close();
      this.notificationService.error('QR codes are not ready to print yet.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(this.buildPrintDocument(canvases));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  private async waitForQrCanvases(
    expected: number
  ): Promise<HTMLCanvasElement[]> {
    const deadline = Date.now() + CANVAS_WAIT_MS;
    while (Date.now() < deadline) {
      const canvases = this.plateRefs()
        .map(ref => ref.nativeElement.querySelector('canvas'))
        .filter((canvas): canvas is HTMLCanvasElement =>
          Boolean(canvas && canvas.width > 0)
        );
      if (canvases.length >= expected) {
        return canvases;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return this.plateRefs()
      .map(ref => ref.nativeElement.querySelector('canvas'))
      .filter((canvas): canvas is HTMLCanvasElement =>
        Boolean(canvas && canvas.width > 0)
      );
  }

  private buildPrintDocument(canvases: HTMLCanvasElement[]): string {
    const assets = this.printableAssets();
    const labels = canvases
      .map((canvas, index) => {
        const asset = assets[index];
        const name = this.escapeHtml(asset?.name ?? 'Asset');
        const code = this.escapeHtml(asset?.assetId ?? '');
        return `<article class="label">
          <img src="${canvas.toDataURL('image/png')}" alt="${name}" />
          <p class="name">${name}</p>
          ${code ? `<p class="code">${code}</p>` : ''}
        </article>`;
      })
      .join('');

    const title = this.escapeHtml(
      `${this.companyName} — Asset QR Labels`
    );

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      @page { margin: 12mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, Segoe UI, sans-serif;
        color: #1e293b;
      }
      h1 {
        margin: 0 0 16px;
        font-size: 14px;
        font-weight: 700;
        text-align: center;
        color: ${BRAND_COLOR};
      }
      .sheet {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .label {
        break-inside: avoid;
        page-break-inside: avoid;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 10px;
        text-align: center;
        background: #fff;
      }
      img {
        width: 180px;
        height: 180px;
        display: block;
        margin: 0 auto 8px;
      }
      .name {
        margin: 0;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.25;
        word-break: break-word;
      }
      .code {
        margin: 4px 0 0;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: ${BRAND_COLOR};
        word-break: break-all;
      }
      @media print {
        h1 { display: none; }
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <div class="sheet">${labels}</div>
  </body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private async downloadCompositeImage(): Promise<void> {
    const plate = this.plateRefs()[0]?.nativeElement;
    const sourceCanvas = plate?.querySelector('canvas');
    const asset = this.asset();
    if (!sourceCanvas || !asset) {
      return;
    }

    const name = asset.name;
    const code = asset.assetId;
    const qrWidth = sourceCanvas.width;
    const qrHeight = sourceCanvas.height;
    const exportWidth = qrWidth + EXPORT_PADDING * 2;

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) {
      return;
    }

    const nameFont = '800 28px system-ui, Segoe UI, sans-serif';
    const codeFont = '700 18px system-ui, Segoe UI, sans-serif';
    const maxTextWidth = qrWidth;

    measureCtx.font = nameFont;
    const nameLines = this.wrapText(measureCtx, name, maxTextWidth);
    measureCtx.font = codeFont;
    const codeLines = code ? this.wrapText(measureCtx, code, maxTextWidth) : [];

    const nameLineHeight = 32;
    const codeLineHeight = 22;
    const dividerGap = 14;
    const textGap = 4;
    const textBlockHeight =
      nameLines.length * nameLineHeight +
      (codeLines.length ? textGap + codeLines.length * codeLineHeight : 0);

    const exportHeight =
      EXPORT_PADDING + qrHeight + dividerGap + textBlockHeight + EXPORT_PADDING;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportWidth, exportHeight);

    const qrX = (exportWidth - qrWidth) / 2;
    const qrY = EXPORT_PADDING;
    ctx.drawImage(sourceCanvas, qrX, qrY);
    await this.drawCenteredLogo(ctx, qrX, qrY, qrWidth, qrHeight);

    const dividerY = qrY + qrHeight + dividerGap / 2;
    const gradient = ctx.createLinearGradient(
      EXPORT_PADDING,
      dividerY,
      exportWidth - EXPORT_PADDING,
      dividerY
    );
    gradient.addColorStop(0, 'rgba(0, 109, 91, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 109, 91, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 109, 91, 0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(EXPORT_PADDING, dividerY);
    ctx.lineTo(exportWidth - EXPORT_PADDING, dividerY);
    ctx.stroke();

    let textY = qrY + qrHeight + dividerGap + nameLineHeight - 10;
    ctx.fillStyle = '#1e293b';
    ctx.font = nameFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const line of nameLines) {
      ctx.fillText(line, exportWidth / 2, textY);
      textY += nameLineHeight;
    }

    if (codeLines.length) {
      textY += textGap;
      ctx.fillStyle = BRAND_COLOR;
      ctx.font = codeFont;
      for (const line of codeLines) {
        ctx.fillText(line, exportWidth / 2, textY);
        textY += codeLineHeight;
      }
    }

    const fileName = `${code || asset.id || 'asset'}-qr-code.png`;
    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    link.download = fileName;
    link.click();
  }

  private drawCenteredLogo(
    ctx: CanvasRenderingContext2D,
    qrX: number,
    qrY: number,
    qrWidth: number,
    qrHeight: number
  ): Promise<void> {
    const logoSize = 65;
    return new Promise(resolve => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = (): void => {
        const x = qrX + (qrWidth - logoSize) / 2;
        const y = qrY + (qrHeight - logoSize) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
        ctx.drawImage(image, x, y, logoSize, logoSize);
        resolve();
      };
      image.onerror = (): void => {
        resolve();
      };
      image.src = this.logoPath;
    });
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return [text];
    }

    const lines: string[] = [];
    let current = words[0];

    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) {
        current = next;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
    return lines;
  }
}
