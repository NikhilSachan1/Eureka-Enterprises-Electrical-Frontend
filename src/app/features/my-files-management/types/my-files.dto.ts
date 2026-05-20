import {
  MyFileItemSchema,
  MyFilesListRequestSchema,
  MyFilesListResponseSchema,
} from '../schemas/my-files.schema';
import z from 'zod';

export type IMyFilesListRequestDto = z.infer<typeof MyFilesListRequestSchema>;
export type IMyFilesListFormDto = z.input<typeof MyFilesListRequestSchema>;
export type IMyFilesListResponseDto = z.infer<typeof MyFilesListResponseSchema>;
export type IMyFileBaseResponseDto = z.infer<typeof MyFileItemSchema>;
