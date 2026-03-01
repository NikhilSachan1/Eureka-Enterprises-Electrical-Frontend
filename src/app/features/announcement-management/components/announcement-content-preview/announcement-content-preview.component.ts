import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-announcement-content-preview',
  imports: [],
  templateUrl: './announcement-content-preview.component.html',
  styleUrl: './announcement-content-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementContentPreviewComponent {
  private readonly domSanitizer = inject(DomSanitizer);

  readonly message = input.required<string>();

  protected getMessageHtml(): SafeHtml {
    const message = this.message() ?? '';
    return this.domSanitizer.bypassSecurityTrustHtml(message);
  }
}
