import {
  MyFileItemSchema,
  MyFilesBreadcrumbItemSchema,
  MyFilesBreadcrumbResponseSchema,
  MyFilesListRequestSchema,
  MyFilesListResponseSchema,
} from '../schemas/my-files.schema';
import z from 'zod';

/**
 * My Files List
 */
export type IMyFilesListRequestDto = z.infer<typeof MyFilesListRequestSchema>;
export type IMyFilesListFormDto = z.input<typeof MyFilesListRequestSchema>;
export type IMyFilesListResponseDto = z.infer<typeof MyFilesListResponseSchema>;
export type IMyFileBaseResponseDto = z.infer<typeof MyFileItemSchema>;

/**
 * My Files Breadcrumb
 */
export type IMyFilesBreadcrumbItemDto = z.infer<
  typeof MyFilesBreadcrumbItemSchema
>;
export type IMyFilesBreadcrumbResponseDto = z.infer<
  typeof MyFilesBreadcrumbResponseSchema
>;
