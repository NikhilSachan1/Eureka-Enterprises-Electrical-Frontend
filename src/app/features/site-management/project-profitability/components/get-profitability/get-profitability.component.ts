import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services/logger.service';
import { LoadingService } from '@shared/services/loading.service';
import { finalize } from 'rxjs';
import {
  IProjectProfitabilityGetFormDto,
  IProjectProfitabilityGetResponseDto,
} from '../../types/project-profitability.dto';
import { ProjectProfitabilityService } from '../../services/project-profitability.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-get-profitability',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './get-profitability.component.html',
  styleUrl: './get-profitability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProfitabilityComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly projectProfitabilityService = inject(
    ProjectProfitabilityService
  );
  private readonly activatedRoute = inject(ActivatedRoute);

  protected projectId = signal<string>('');

  ngOnInit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    this.projectId.set(projectId);
    this.getProjectProfitability();
  }

  private getProjectProfitability(): void {
    this.loadingService.show({
      title: 'Loading Project Profitability',
      message: 'Please wait while we load the project profitability...',
    });

    const paramData = this.prepareParamData();

    this.projectProfitabilityService
      .getProjectProfitability(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: IProjectProfitabilityGetResponseDto) => {
          this.logger.logUserAction(
            'Project profitability loaded successfully'
          );
        },
        error: error => {
          this.logger.logUserAction(
            'Failed to load project profitability',
            error
          );
        },
      });
  }

  private prepareParamData(): IProjectProfitabilityGetFormDto {
    return {
      projectName: this.projectId(),
    };
  }
}
