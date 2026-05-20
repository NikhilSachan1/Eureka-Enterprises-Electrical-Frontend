import {
  MyFileItemSchema,
  MyFilesBreadcrumbItemSchema,
  MyFilesBreadcrumbResponseSchema,
  MyFilesCreateFolderRequestSchema,
  MyFilesCreateFolderResponseSchema,
  MyFilesListRequestSchema,
  MyFilesListResponseSchema,
  MyFilesRenameRequestSchema,
  MyFilesRenameResponseSchema,
  MyFilesUploadRequestSchema,
  MyFilesUploadResponseSchema,
  MyFilesDeleteResponseSchema,
} from '../schemas';
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

/**
 * My Files Rename
 */
export type IMyFilesRenameFormDto = z.input<typeof MyFilesRenameRequestSchema>;
export type IMyFilesRenameUIFormDto = z.infer<
  typeof MyFilesRenameRequestSchema
>;
export type IMyFilesRenameResponseDto = z.infer<
  typeof MyFilesRenameResponseSchema
>;

/**
 * My Files Create Folder
 */
export type IMyFilesCreateFolderFormDto = z.input<
  typeof MyFilesCreateFolderRequestSchema
>;

export type IMyFilesCreateFolderUIFormDto = Omit<
  IMyFilesCreateFolderFormDto,
  'parentId'
>;

export type IMyFilesCreateFolderResponseDto = z.infer<
  typeof MyFilesCreateFolderResponseSchema
>;

/**
 * My Files Upload
 */
export type IMyFilesUploadFormDto = z.input<typeof MyFilesUploadRequestSchema>;
export type IMyFilesUploadUIFormDto = Omit<IMyFilesUploadFormDto, 'parentId'>;
export type IMyFilesUploadResponseDto = z.infer<
  typeof MyFilesUploadResponseSchema
>;

/**
 * My Files Delete
 */
export type IMyFilesDeleteResponseDto = z.infer<
  typeof MyFilesDeleteResponseSchema
>;
