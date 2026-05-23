import { ICronGetJobDto } from './cron.dto';

export interface ICron {
  id: string;
  cronJobTitle: string;
  cronJobName: string;
  cronJobDescription: string;
  schedule: string;
  cronExpression: string;
  nextRunAt: string | null;
  requiredParameters: string[];
  dependencies: string[];
  originalRawData: ICronGetJobDto;
}
