import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DashboardService } from '@features/dashboard/services/dashboard.services';
import { IReceivablesPayablesGetResponseDto } from '@features/dashboard/types/dashboard.dto';
import { ReceivablesPartyPanelComponent } from './receivables-party-panel.component';

@Component({
  selector: 'app-receivables-payables-dashboard',
  imports: [ReceivablesPartyPanelComponent],
  templateUrl: './receivables-payables-dashboard.component.html',
  styleUrl: './receivables-payables-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivablesPayablesDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly data = signal<IReceivablesPayablesGetResponseDto | null>(
    null
  );
  protected readonly receivableParties = computed(() => {
    const summary = this.data();
    return summary ? summary.receivable.parties : [];
  });
  protected readonly payableParties = computed(() => {
    const summary = this.data();
    return summary ? summary.payable.parties : [];
  });
  protected readonly receivableOutstanding = computed(() => {
    const summary = this.data();
    return summary ? summary.receivable.outstanding : 0;
  });
  protected readonly payableOutstanding = computed(() => {
    const summary = this.data();
    return summary ? summary.payable.outstanding : 0;
  });

  ngOnInit(): void {
    this.dashboardService
      .getReceivablesPayablesShared()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response: IReceivablesPayablesGetResponseDto) => {
          this.data.set(response);
        },
      });
  }
}
