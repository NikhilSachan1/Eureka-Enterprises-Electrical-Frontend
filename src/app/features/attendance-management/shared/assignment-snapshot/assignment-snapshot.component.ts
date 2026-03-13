import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ICONS } from '@shared/constants';
import { LoadingService, NotificationService } from '@shared/services';
import { AttendanceService } from '../../services/attendance.service';
import { IAttendanceCurrentStatusGetResponseDto } from '../../types/attendance.dto';

@Component({
  selector: 'app-assignment-snapshot',
  standalone: true,
  templateUrl: './assignment-snapshot.component.html',
  styleUrl: './assignment-snapshot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentSnapshotComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ALL_ICONS = ICONS;

  assignmentSnapshot = model<IAttendanceCurrentStatusGetResponseDto | null>(
    null
  );

  userId = input<string | null>(null);

  getContractorNames(contractors: { id: string; name: string }[]): string {
    return contractors.map(c => c.name).join(', ');
  }

  constructor() {
    effect(() => {
      const id = this.userId();
      if (id && typeof id === 'string' && id.trim() !== '') {
        this.loadCurrentStatusByUser(id);
      } else {
        this.assignmentSnapshot.set(null);
      }
    });
  }

  private loadCurrentStatusByUser(userId: string): void {
    this.loadingService.show({
      title: 'Loading Assignment',
      message: 'Fetching current assignment for the selected employee...',
    });

    this.attendanceService
      .getAttendanceCurrentStatusByUser(userId)
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.assignmentSnapshot.set(response);
        },
        error: () => {
          this.assignmentSnapshot.set(null);
          this.notificationService.error(
            'Failed to load assignment for this employee.'
          );
        },
      });
  }
}
