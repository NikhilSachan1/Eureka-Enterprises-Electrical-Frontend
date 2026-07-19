import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { IAssetGetBaseResponseDto } from '@features/asset-management/types/asset.dto';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { QRCodeComponent } from 'angularx-qrcode';

const QR_SIZE = 260;
const EXPORT_PADDING = 16;
const BRAND_COLOR = '#006d5b';

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

  private readonly plateRef = viewChild<ElementRef<HTMLElement>>('qrPlate');

  protected readonly selectedRecord =
    input.required<IAssetGetBaseResponseDto[]>();

  protected readonly companyName = APP_CONFIG.name;
  protected readonly logoPath = APP_CONFIG.logoPath;
  protected readonly qrWidth = QR_SIZE;

  protected readonly asset = computed(() => this.selectedRecord()?.[0] ?? null);

  protected readonly assetName = computed(
    () => this.asset()?.name?.trim() || 'Asset'
  );

  protected readonly assetCode = computed(
    () => this.asset()?.assetId?.trim() || ''
  );

  protected readonly qrData = computed(() => {
    const asset = this.asset();
    if (!asset?.id) {
      return '';
    }
    return `${window.location.origin}/${ROUTE_BASE_PATHS.PUBLIC}/${ROUTE_BASE_PATHS.ASSET}/${asset.id}`;
  });

  protected readonly downloadFileName = computed(() => {
    const code = this.assetCode() || this.asset()?.id || 'asset';
    return `${code}-qr-code.png`;
  });

  async onDialogAccept(): Promise<void> {
    await this.downloadCompositeImage();
  }

  onDialogReject(): void {
    this.confirmationDialogService.closeDialog();
  }

  private async downloadCompositeImage(): Promise<void> {
    const plate = this.plateRef()?.nativeElement;
    const sourceCanvas = plate?.querySelector('canvas');
    if (!sourceCanvas) {
      return;
    }

    const name = this.assetName();
    const code = this.assetCode();
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

    const link = document.createElement('a');
    link.href = exportCanvas.toDataURL('image/png');
    link.download = this.downloadFileName();
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
