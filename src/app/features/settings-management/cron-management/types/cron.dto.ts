import { z } from 'zod';
import { CronGetResponseSchema } from '../schemas/get-cron.schema';
import {
  CronRunRequestSchema,
  CronRunResponseSchema,
} from '../schemas/run-cron.schema';

/*
  Cron Get
*/
export type ICronGetResponseDto = z.infer<typeof CronGetResponseSchema>;
export type ICronGetJobDto = ICronGetResponseDto['jobs'][number];

/*
  Cron Run
*/
export type ICronRunRequestDto = z.infer<typeof CronRunRequestSchema>;
export type ICronRunFormDto = z.input<typeof CronRunRequestSchema>;
export type ICronRunUIFormDto = Omit<ICronRunFormDto, 'cronName'>;
export type ICronRunResponseDto = z.infer<typeof CronRunResponseSchema>;
