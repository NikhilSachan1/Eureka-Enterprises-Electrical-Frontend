import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { BankDetailsCellComponent } from '@shared/components/bank-details-cell/bank-details-cell.component';
import { TimelineComponent } from '@shared/components/timeline/timeline.component';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { ICONS } from '@shared/constants';
import {
  AppConfigurationService,
  AvatarService,
  GalleryService,
} from '@shared/services';
import {
  EBankDetailsDisplayMode,
  ETimelineAlign,
  ETimelineLayout,
  IGalleryInputData,
  ITimelineConfig,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { finalize } from 'rxjs';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IPaymentSheetTimelineDrawerData,
  IPaymentSheetTimelineEventDetail,
  IPaymentSheetTimelineEventView,
  TPaymentSheetHistoryEntryView,
  TPaymentSheetStageLogView,
} from '../../types/payment-sheet-detail.interface';
import {
  EPaymentSheetHistoryAction,
  EPaymentSheetStage,
  EPaymentSheetStageLogAction,
  EPaymentSheetTimelineMode,
  EPaymentSheetWorkflowRole,
} from '../../types/payment-sheet.enum';
import { getPaymentSheetVerificationStageLabel } from '../../utils/payment-sheet-verification.util';

const ROLE_LABELS: Record<string, string> = {
  [EPaymentSheetWorkflowRole.OPERATION_MANAGER]: 'Operation Manager',
  [EPaymentSheetWorkflowRole.HR]: 'HR',
  [EPaymentSheetWorkflowRole.ADMIN]: 'Admin',
  [EPaymentSheetWorkflowRole.ACCOUNTS]: 'Accounts',
};

const REMOVED_ACTION_ALIASES = new Set(['REMOVED', 'ITEM_DELETED', 'DELETED']);

@Component({
  selector: 'app-payment-sheet-timeline-drawer',
  imports: [DatePipe, TimelineComponent, BankDetailsCellComponent],
  templateUrl: './payment-sheet-timeline-drawer.component.html',
  styleUrl: './payment-sheet-timeline-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSheetTimelineDrawerComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(
    DRAWER_DATA
  ) as IPaymentSheetTimelineDrawerData;

  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly avatarService = inject(AvatarService);
  private readonly galleryService = inject(GalleryService);
  private readonly paymentSheetService = inject(PaymentSheetService);

  private readonly shouldFetchStageLogs =
    this.drawerData.mode === EPaymentSheetTimelineMode.WORKFLOW &&
    this.drawerData.stageLogs === undefined;

  protected readonly isDrawerLoading = this.drawerService.loading;

  protected readonly ICONS = ICONS;
  protected readonly EBankDetailsDisplayMode = EBankDetailsDisplayMode;
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT_WITH_TIME;
  protected readonly dateLocale = APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE;

  protected readonly contextSheetNumber = signal(this.drawerData.sheetNumber);
  protected readonly contextSubtitle = signal(this.drawerData.contextSubtitle);
  protected readonly events = signal<IPaymentSheetTimelineEventView[]>([]);

  protected readonly contextAvatarUrl = computed(() =>
    this.avatarService.getAvatarFromName(
      this.contextSubtitle() || this.contextSheetNumber()
    )
  );

  protected readonly timelineConfig = computed(
    (): Partial<ITimelineConfig> => ({
      value: this.events(),
      layout: ETimelineLayout.VERTICAL,
      align: ETimelineAlign.LEFT,
    })
  );

  protected readonly emptyState = computed(() =>
    this.drawerData.mode === EPaymentSheetTimelineMode.WORKFLOW
      ? {
          title: 'No workflow steps yet',
          text: 'Stage transitions will appear here once the payment sheet moves forward.',
        }
      : {
          title: 'No activity yet',
          text: 'Actions on this beneficiary will appear here once recorded.',
        }
  );

  override onDrawerShow(): void {
    if (this.drawerData.mode === EPaymentSheetTimelineMode.WORKFLOW) {
      const { stageLogs } = this.drawerData;

      if (stageLogs !== undefined) {
        this.events.set(this.buildStageLogEvents(stageLogs));
        return;
      }

      this.setDrawerLoading(true);
      this.loadStageLogs();
      return;
    }

    this.events.set(this.buildItemHistoryEvents());
  }

  private loadStageLogs(): void {
    const { drawerData } = this;

    if (drawerData.mode !== EPaymentSheetTimelineMode.WORKFLOW) {
      return;
    }

    const { paymentSheetId } = drawerData;

    if (!paymentSheetId) {
      this.events.set([]);
      return;
    }

    this.setDrawerLoading(true);

    this.paymentSheetService
      .getPaymentSheetDetailById({ paymentSheetId })
      .pipe(
        finalize(() => this.setDrawerLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: detail => {
          this.contextSheetNumber.set(detail.sheetNumber);
          this.contextSubtitle.set(
            detail.title?.trim() ? detail.title.trim() : '—'
          );
          this.events.set(this.buildStageLogEvents(detail.stageLogs));
        },
        error: error => {
          this.events.set([]);
          this.logger.error('Failed to load payment sheet workflow', error);
        },
      });
  }

  private buildStageLogEvents(
    stageLogs: TPaymentSheetStageLogView[] | undefined
  ): IPaymentSheetTimelineEventView[] {
    if (!stageLogs?.length) {
      return [];
    }

    return [...stageLogs]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
      )
      .map(log => {
        const fromLabel = this.resolveStageLabel(log.fromStage);
        const toLabel = this.resolveStageLabel(log.toStage);
        const roleLabel = log.actedRole
          ? (ROLE_LABELS[log.actedRole] ?? log.actedRole.replaceAll('_', ' '))
          : undefined;
        const { icon, tone, title } = this.getStageLogPresentation(log.action, {
          fromStage: log.fromStage,
          toStage: log.toStage,
          toStageLabel: toLabel === '—' ? undefined : toLabel,
        });
        const details: IPaymentSheetTimelineEventDetail[] = [];

        if (log.fromStage && log.toStage) {
          details.push({
            icon: ICONS.COMMON.ARROW_RIGHT,
            label: 'Workflow movement',
            value: `${fromLabel} → ${toLabel}`,
          });
        } else if (log.fromStage) {
          details.push({
            icon: ICONS.COMMON.ARROW_LEFT,
            label: 'Previous stage',
            value: fromLabel,
          });
        } else if (log.toStage) {
          details.push({
            icon: ICONS.COMMON.ARROW_RIGHT,
            label: 'Next stage',
            value: toLabel,
          });
        }

        if (roleLabel) {
          details.push({
            icon: ICONS.COMMON.BRIEFCASE,
            label: 'Role',
            value: roleLabel,
          });
        }

        const remarks = this.resolveRemarks(log.remarks);

        if (remarks) {
          details.push({
            icon: ICONS.COMMON.MEGAPHONE,
            label: 'Remarks',
            value: remarks,
            variant: 'note',
          });
        }

        return this.createTimelineEvent({
          id: log.id,
          occurredAt: log.createdAt,
          title,
          details,
          icon,
          tone,
          performedBy: this.resolvePerformedByName(log.createdByUser),
        });
      });
  }

  private buildItemHistoryEvents(): IPaymentSheetTimelineEventView[] {
    if (this.drawerData.mode !== EPaymentSheetTimelineMode.ITEM_HISTORY) {
      return [];
    }

    const { itemId, history } = this.drawerData;

    if (!history?.length || !itemId) {
      return [];
    }

    return [...history]
      .filter(entry => entry.itemId === itemId)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
      )
      .map(entry =>
        this.mapHistoryEntryToTimelineEvent(
          entry,
          this.resolveReviewStageLabel(entry.stage)
        )
      );
  }

  private mapHistoryEntryToTimelineEvent(
    entry: TPaymentSheetHistoryEntryView,
    stageLabel: string
  ): IPaymentSheetTimelineEventView {
    const reviewStageDetail: IPaymentSheetTimelineEventDetail = {
      icon: ICONS.COMMON.BRIEFCASE,
      label: 'Review stage',
      value: stageLabel,
    };
    const performedBy = this.resolvePerformedByName(entry.createdByUser);
    const action = this.normalizeHistoryAction(entry.action);

    switch (action) {
      case EPaymentSheetHistoryAction.ITEM_ADDED:
        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: 'Added to sheet',
          icon: ICONS.COMMON.PLUS,
          tone: 'info',
          details: this.withRemarks(entry, [
            reviewStageDetail,
            {
              icon: ICONS.EXPENSE.MONEY,
              label: 'Payable amount',
              value: this.formatPaymentAmount(entry.newAmount),
              variant: 'emphasis',
            },
          ]),
          performedBy,
        });

      case EPaymentSheetHistoryAction.ITEM_REMOVED:
        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: 'Removed from sheet',
          icon: ICONS.ACTIONS.TRASH,
          tone: 'removed',
          details: this.withRemarks(entry, [reviewStageDetail]),
          performedBy,
        });

      case EPaymentSheetHistoryAction.VERIFIED:
        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: 'Verified',
          icon: ICONS.ACTIONS.CHECK,
          tone: 'success',
          details: this.withRemarks(entry, [reviewStageDetail]),
          performedBy,
        });

      case EPaymentSheetHistoryAction.UNVERIFIED:
        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: 'Verification removed',
          icon: ICONS.ACTIONS.TIMES,
          tone: 'removed',
          details: this.withRemarks(entry, [reviewStageDetail]),
          performedBy,
        });

      case EPaymentSheetHistoryAction.REJECTED:
        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: 'Rejected',
          icon: ICONS.ACTIONS.BAN,
          tone: 'danger',
          details: this.withRemarks(entry, [reviewStageDetail], 'Remarks'),
          performedBy,
        });

      case EPaymentSheetHistoryAction.PAID: {
        const details: IPaymentSheetTimelineEventDetail[] = [
          reviewStageDetail,
          {
            icon: ICONS.PAYROLL.PAID,
            label: 'Amount paid',
            value: this.formatPaymentAmount(entry.newAmount),
            variant: 'emphasis',
          },
        ];
        const paymentRef = entry.reason?.trim();

        if (paymentRef) {
          details.push({
            icon: ICONS.COMMON.TAG,
            label: 'Payment reference',
            value: paymentRef,
          });
        }

        if (
          this.drawerData.mode === EPaymentSheetTimelineMode.ITEM_HISTORY &&
          this.drawerData.paidFromAccount
        ) {
          details.push({
            icon: ICONS.PAYROLL.WALLET,
            label: 'Paid from',
            bankDetails: this.drawerData.paidFromAccount,
            variant: 'paidFrom',
          });
        }

        if (this.drawerData.mode === EPaymentSheetTimelineMode.ITEM_HISTORY) {
          const { paymentAdvice } = this.drawerData;

          if (paymentAdvice) {
            details.push({
              icon: ICONS.COMMON.FILE,
              label: 'Payment Advice',
              value: paymentAdvice.referenceNumber,
            });

            if (paymentAdvice.pdfKey) {
              details.push({
                icon: ICONS.MEDIA.PDF,
                label: 'PA Attachment',
                attachmentKeys: [paymentAdvice.pdfKey],
                variant: 'attachment',
              });
            }
          }
        }

        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: 'Payment recorded',
          icon: ICONS.PAYROLL.PAID,
          tone: 'paid',
          details,
          performedBy,
        });
      }

      case EPaymentSheetHistoryAction.AMOUNT_EDIT:
        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: 'Amount updated',
          icon: ICONS.ACTIONS.EDIT,
          tone: 'updated',
          details: this.withRemarks(entry, [
            reviewStageDetail,
            {
              icon: ICONS.ACTIONS.EDIT,
              label: 'Amount',
              value: `${this.formatPaymentAmount(entry.previousAmount)} → ${this.formatPaymentAmount(entry.newAmount)}`,
              variant: 'emphasis',
            },
          ]),
          performedBy,
        });

      default:
        return this.createTimelineEvent({
          id: entry.id,
          occurredAt: entry.createdAt,
          title: entry.action.replaceAll('_', ' '),
          icon: ICONS.COMMON.HISTORY,
          tone: 'neutral',
          details: this.withRemarks(entry, [reviewStageDetail]),
          performedBy,
        });
    }
  }

  private createTimelineEvent(
    event: Omit<IPaymentSheetTimelineEventView, 'performedBy'> & {
      performedBy?: string;
    }
  ): IPaymentSheetTimelineEventView {
    return {
      ...event,
      performedBy: event.performedBy ?? '—',
    };
  }

  private resolvePerformedByName(
    user:
      | {
          firstName?: string | null;
          lastName?: string | null;
          fullName?: string | null;
        }
      | null
      | undefined
  ): string {
    if (!user) {
      return '—';
    }

    const fullName = user.fullName?.trim();

    if (fullName) {
      return fullName;
    }

    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    return name || '—';
  }

  private withRemarks(
    entry: TPaymentSheetHistoryEntryView,
    details: IPaymentSheetTimelineEventDetail[],
    label = 'Remarks'
  ): IPaymentSheetTimelineEventDetail[] {
    const remarks = this.resolveRemarks(entry.reason, entry.remarks);

    if (!remarks) {
      return details;
    }

    return [
      ...details,
      {
        icon: ICONS.COMMON.MEGAPHONE,
        label,
        value: remarks,
        variant: 'note',
      },
    ];
  }

  private getStageLogPresentation(
    action: string,
    options?: {
      fromStage?: string | null;
      toStage?: string | null;
      toStageLabel?: string;
    }
  ): Pick<IPaymentSheetTimelineEventView, 'icon' | 'tone' | 'title'> {
    switch (action) {
      case EPaymentSheetStageLogAction.SUBMIT:
        return {
          title: this.isInitiationStageLog(options)
            ? 'Draft'
            : 'Submitted for review',
          icon: ICONS.ACTIONS.SEND,
          tone: 'primary',
        };

      case EPaymentSheetStageLogAction.FORWARD:
        return {
          title: options?.toStageLabel
            ? `Forwarded to ${options.toStageLabel}`
            : 'Forwarded to next stage',
          icon: ICONS.COMMON.FORWARD,
          tone: 'info',
        };

      case EPaymentSheetStageLogAction.RETURN:
        return {
          title: 'Returned to previous stage',
          icon: ICONS.COMMON.ARROW_LEFT,
          tone: 'warning',
        };

      case EPaymentSheetStageLogAction.REJECT:
        return {
          title: 'Sheet rejected',
          icon: ICONS.ACTIONS.BAN,
          tone: 'danger',
        };

      default:
        return {
          title: action.replaceAll('_', ' '),
          icon: ICONS.COMMON.HISTORY,
          tone: 'neutral',
        };
    }
  }

  private resolveStageLabel(stage: string | null | undefined): string {
    if (!stage) {
      return '—';
    }

    if (stage === EPaymentSheetStage.INITIATION) {
      return 'Draft';
    }

    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.paymentSheetStages() ?? [],
      stage
    );
  }

  private isInitiationStageLog(options?: {
    fromStage?: string | null;
    toStage?: string | null;
  }): boolean {
    return (
      options?.toStage === EPaymentSheetStage.INITIATION ||
      (options?.fromStage === EPaymentSheetStage.INITIATION &&
        !options?.toStage)
    );
  }

  private resolveReviewStageLabel(stage: string): string {
    const verificationLabel = getPaymentSheetVerificationStageLabel(stage);

    return verificationLabel !== stage
      ? verificationLabel
      : this.resolveStageLabel(stage);
  }

  private normalizeHistoryAction(
    action: string
  ): EPaymentSheetHistoryAction | string {
    const normalized = action.toUpperCase();

    return REMOVED_ACTION_ALIASES.has(normalized)
      ? EPaymentSheetHistoryAction.ITEM_REMOVED
      : normalized;
  }

  private resolveRemarks(
    ...candidates: (string | null | undefined)[]
  ): string | undefined {
    for (const candidate of candidates) {
      const trimmed = candidate?.trim();

      if (trimmed) {
        return trimmed;
      }
    }

    return undefined;
  }

  private formatPaymentAmount(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || Number.isNaN(amount)) {
      return '—';
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  protected viewTimelineAttachments(
    attachmentKeys: string[] | undefined
  ): void {
    const keys = attachmentKeys?.map(key => key.trim()).filter(Boolean) ?? [];

    if (!keys.length) {
      return;
    }

    const media: IGalleryInputData[] = keys.map(mediaKey => ({
      mediaKey,
      actualMediaUrl: '',
    }));

    this.galleryService.show(media);
  }

  private initLoadingForFetch(): null {
    if (this.shouldFetchStageLogs) {
      this.setDrawerLoading(true);
    }

    return null;
  }
}
