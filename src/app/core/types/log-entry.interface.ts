import { ELogTypes } from './logger.enum';

export type LogCategory =
  | 'http'
  | 'router'
  | 'navigation'
  | 'component'
  | 'error'
  | 'user_action'
  | 'info';

export interface ILogEntry {
  id: string;
  timestamp: string;
  level: ELogTypes;
  category: LogCategory;
  message: string;
  /** Component/Service/Class name that originated the log */
  source?: string;
  /** Method name that originated the log */
  method?: string;
  /** Parsed stack trace frames (component.function file:line) */
  callStack?: string[];
  /** Additional structured data */
  data?: unknown;
  /** URL when log occurred */
  url?: string;
  /** For HTTP: correlation ID to match request-response */
  correlationId?: string;
  /** For HTTP: request duration in ms */
  durationMs?: number;
  /** Page/component that was active when this log occurred (from last navigation) */
  currentPage?: string;
}
