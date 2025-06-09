import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-apply-attendance',
  imports: [
    PageHeaderComponent,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './apply-attendance.component.html',
  styleUrl: './apply-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplyAttendanceComponent {
  // Component now uses static data in HTML template
  // No dynamic functionality needed
}
