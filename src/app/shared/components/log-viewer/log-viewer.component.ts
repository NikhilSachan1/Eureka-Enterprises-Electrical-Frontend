import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '@core/services';
import { EnvironmentService } from '@core/services/environment.service';
import { ILogEntry, LogCategory } from '@core/types';

@Component({
  selector: 'app-log-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (env.isLoggingEnabled && env.isDevelopment) {
      <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        @if (isOpen()) {
          <div
            class="w-[520px] max-h-[70vh] overflow-hidden rounded-lg border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur"
          >
            <div
              class="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-3 py-2"
            >
              <span class="text-sm font-semibold text-slate-200">
                📋 Logs ({{ logCount() }})
              </span>
              <div class="flex gap-1">
                <button
                  type="button"
                  (click)="downloadLogs()"
                  class="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white"
                >
                  Export
                </button>
                <button
                  type="button"
                  (click)="clearLogs()"
                  class="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white"
                >
                  Clear
                </button>
                <button
                  type="button"
                  (click)="isOpen.set(false)"
                  class="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div class="flex gap-1 border-b border-slate-700 px-2 py-1">
              @for (cat of categories; track cat) {
                <button
                  type="button"
                  (click)="toggleFilter(cat)"
                  [class.bg-slate-600]="filter()[cat]"
                  [class.text-white]="filter()[cat]"
                  class="rounded px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-600"
                >
                  {{ cat }}
                </button>
              }
            </div>
            <div
              class="max-h-[50vh] overflow-y-auto p-2 font-mono text-xs"
              style="direction: ltr;"
            >
              @for (entry of filteredLogs(); track entry.id) {
                <div
                  class="mb-1 rounded border border-slate-700/50 bg-slate-800/50"
                >
                  <button
                    type="button"
                    (click)="toggleExpand(entry.id)"
                    class="w-full p-2 text-left"
                  >
                    <div
                      class="flex items-start gap-1 flex-wrap text-slate-300"
                      [ngClass]="{
                        'border-red-500/50': entry.level === 'error',
                        'border-amber-500/50': entry.level === 'warn',
                      }"
                    >
                      <span class="shrink-0 text-[10px]">{{
                        formatTime(entry.timestamp)
                      }}</span>
                      <span
                        class="shrink-0 rounded px-1 text-[10px]"
                        [ngClass]="{
                          'bg-red-500/30': entry.level === 'error',
                          'bg-amber-500/30': entry.level === 'warn',
                          'bg-sky-500/30': entry.category === 'http',
                          'bg-emerald-500/30': entry.category === 'router',
                        }"
                      >
                        {{ entry.category }}
                      </span>
                      @if (entry.source) {
                        <span class="font-medium text-amber-300">
                          {{ entry.source
                          }}{{ entry.method ? '.' + entry.method : '' }}
                        </span>
                      }
                      <span class="ml-auto text-slate-500">{{
                        expandedId() === entry.id ? '▼' : '▶'
                      }}</span>
                    </div>
                    <div class="mt-0.5 truncate text-slate-400">
                      {{ entry.message }}
                    </div>
                    @if (entry.durationMs) {
                      <span class="text-[10px] text-slate-500"
                        >{{ entry.durationMs }}ms</span
                      >
                    }
                  </button>
                  @if (expandedId() === entry.id && entry.data) {
                    <div
                      class="border-t border-slate-700/50 bg-slate-900/80 p-2 text-[11px]"
                    >
                      @if (
                        entry.category === 'http' &&
                        (entry.currentPage ||
                          entry.callStack?.length ||
                          entry.source)
                      ) {
                        <div class="mb-2">
                          <span class="text-cyan-400 text-xs font-medium">
                            Full flow history:
                          </span>
                          <div
                            class="mt-1 space-y-1 rounded bg-slate-950 p-2 text-[11px]"
                          >
                            @if (entry.currentPage) {
                              <div class="flex items-center gap-1.5">
                                <span class="text-slate-500">1.</span>
                                <span class="text-amber-400">{{
                                  entry.currentPage
                                }}</span>
                                <span class="text-slate-500"
                                  >loaded (route)</span
                                >
                              </div>
                            }
                            @if (entry.callStack?.length) {
                              @for (
                                frame of entry.callStack;
                                track frame;
                                let i = $index
                              ) {
                                <div class="flex items-center gap-1.5">
                                  <span class="text-slate-500"
                                    >{{
                                      (entry.currentPage ? 2 : 1) + i
                                    }}.</span
                                  >
                                  <span
                                    [class.text-amber-400]="
                                      frame.includes('Component')
                                    "
                                    [class.text-emerald-400]="
                                      frame.includes('Service')
                                    "
                                    [class.text-sky-400]="
                                      !frame.includes('Component') &&
                                      !frame.includes('Service')
                                    "
                                  >
                                    {{ frame }}
                                  </span>
                                </div>
                              }
                            } @else if (entry.source) {
                              <div class="flex items-center gap-1.5">
                                <span class="text-slate-500">{{
                                  entry.currentPage ? '2.' : '1.'
                                }}</span>
                                <span class="text-amber-400"
                                  >{{ entry.source
                                  }}{{
                                    entry.method ? '.' + entry.method : ''
                                  }}</span
                                >
                                <span class="text-slate-500">→ API</span>
                              </div>
                            }
                          </div>
                        </div>
                      }
                      @if (
                        entry.category !== 'http' &&
                        (entry.source || entry.callStack?.length)
                      ) {
                        <div class="mb-2">
                          @if (entry.callStack?.length) {
                            <pre
                              class="mt-1 max-h-16 overflow-auto rounded bg-slate-950 p-1.5 text-[10px] text-slate-400"
                              >{{
                                (entry.callStack ?? []).join(
                                  '
'
                                )
                              }}</pre
                            >
                          } @else if (entry.source) {
                            <span class="text-amber-400"
                              >{{ entry.source
                              }}{{
                                entry.method ? '.' + entry.method : ''
                              }}</span
                            >
                          }
                        </div>
                      }
                      @if (getPayload(entry)) {
                        <div class="mb-2">
                          <span class="text-cyan-400">Payload:</span>
                          <pre
                            class="mt-0.5 max-h-24 overflow-auto break-all rounded bg-slate-950 p-1.5 text-slate-300"
                            >{{ formatData(getPayload(entry)) }}</pre
                          >
                        </div>
                      }
                      @if (getResponse(entry)) {
                        <div>
                          <span class="text-emerald-400">Response:</span>
                          <pre
                            class="mt-0.5 max-h-32 overflow-auto break-all rounded bg-slate-950 p-1.5 text-slate-300"
                            >{{ formatData(getResponse(entry)) }}</pre
                          >
                        </div>
                      }
                      @if (!getPayload(entry) && !getResponse(entry)) {
                        <pre
                          class="max-h-32 overflow-auto break-all rounded bg-slate-950 p-1.5 text-slate-300"
                          >{{ formatData(entry.data) }}</pre
                        >
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
        <button
          type="button"
          (click)="isOpen.set(!isOpen())"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-lg shadow-lg hover:bg-slate-700"
        >
          📋
        </button>
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogViewerComponent {
  readonly logger = inject(LoggerService);
  readonly env = inject(EnvironmentService);

  readonly isOpen = signal(false);
  readonly expandedId = signal<string | null>(null);
  readonly logCount = this.logger.logCount;

  toggleExpand(id: string): void {
    this.expandedId.update(current => (current === id ? null : id));
  }

  readonly categories: LogCategory[] = [
    'http',
    'router',
    'navigation',
    'component',
    'error',
    'info',
  ];

  readonly filter = signal<Record<LogCategory, boolean>>({
    http: true,
    router: true,
    navigation: true,
    component: true,
    error: true,
    user_action: true,
    info: false,
  });

  readonly filteredLogs = computed(() => {
    const logs = this.logger.logs();
    const f = this.filter();
    return logs.filter(entry => f[entry.category] !== false);
  });

  toggleFilter(cat: LogCategory): void {
    this.filter.update(prev => ({ ...prev, [cat]: !prev[cat] }));
  }

  clearLogs(): void {
    this.logger.clearLogs();
  }

  downloadLogs(): void {
    this.logger.downloadLogs();
  }

  formatData(data: unknown): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  formatTime(iso: string): string {
    return iso.length >= 19 ? iso.slice(11, 19) : iso;
  }

  getPayload(entry: ILogEntry): unknown {
    const d = entry.data as Record<string, unknown> | undefined;
    return d?.['payload'];
  }

  getResponse(entry: ILogEntry): unknown {
    const d = entry.data as Record<string, unknown> | undefined;
    return d?.['response'];
  }
}
