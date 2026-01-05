import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-show-announcement',
  standalone: true,
  imports: [],
  templateUrl: './show-announcement.component.html',
  styleUrl: './show-announcement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowAnnouncementComponent {}
