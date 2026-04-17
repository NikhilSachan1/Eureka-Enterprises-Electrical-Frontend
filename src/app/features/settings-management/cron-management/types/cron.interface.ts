import { ICronGetJobDto } from './cron.dto';

export interface ICron {
  id: string;
  cronJobTitle: string;
  cronJobName: string;
  cronJobDescription: string;
  requiredParameters: string[];
  dependencies: string[];
  originalRawData: ICronGetJobDto;
}
