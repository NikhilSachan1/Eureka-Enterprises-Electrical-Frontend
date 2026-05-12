import { z } from 'zod';
import {
  AddPoRequestSchema,
  AddPoResponseSchema,
  EditPoRequestSchema,
  EditPoResponseSchema,
  ApprovePoRequestSchema,
  ApprovePoResponseSchema,
  DeletePoResponseSchema,
  PoDetailGetResponseSchema,
  PoDropdownGetRequestSchema,
  PoDropdownGetResponseSchema,
  PoDropdownRecordSchema,
  PoGetBaseResponseSchema,
  PoGetRequestSchema,
  PoGetResponseSchema,
  RejectPoRequestSchema,
  RejectPoResponseSchema,
  UnlockGrantPoResponseSchema,
  UnlockRejectPoResponseSchema,
  UnlockRequestPoRequestSchema,
  UnlockRequestPoResponseSchema,
} from '../schemas';
import { PoDetailGetRequestSchema } from '../schemas/get-po-detail.schema';

/*
  PO Get
*/

export type IPoGetBaseResponseDto = z.infer<typeof PoGetBaseResponseSchema>;
export type IPoGetResponseDto = z.infer<typeof PoGetResponseSchema>;
export type IPoGetRequestDto = z.infer<typeof PoGetRequestSchema>;
export type IPoGetFormDto = z.input<typeof PoGetRequestSchema>;

/*
  PO Detail Get
*/
export type IPoDetailGetResponseDto = z.infer<typeof PoDetailGetResponseSchema>;
export type IPoDetailGetRequestDto = z.infer<typeof PoDetailGetRequestSchema>;

/*
  PO Approve
*/
export type IApprovePoRequestDto = z.infer<typeof ApprovePoRequestSchema>;
export type IApprovePoFormDto = z.input<typeof ApprovePoRequestSchema>;
export type IApprovePoResponseDto = z.infer<typeof ApprovePoResponseSchema>;

/*
  PO Reject
*/
export type IRejectPoRequestDto = z.infer<typeof RejectPoRequestSchema>;
export type IRejectPoFormDto = z.input<typeof RejectPoRequestSchema>;
export type IRejectPoResponseDto = z.infer<typeof RejectPoResponseSchema>;

/*
  PO Unlock Request
*/
export type IUnlockRequestPoRequestDto = z.infer<
  typeof UnlockRequestPoRequestSchema
>;
export type IUnlockRequestPoFormDto = z.input<
  typeof UnlockRequestPoRequestSchema
>;
export type IUnlockRequestPoResponseDto = z.infer<
  typeof UnlockRequestPoResponseSchema
>;

/*
  PO Unlock Grant
*/
export type IUnlockGrantPoResponseDto = z.infer<
  typeof UnlockGrantPoResponseSchema
>;

/*
  PO Delete
*/
export type IDeletePoResponseDto = z.infer<typeof DeletePoResponseSchema>;

/**
 * PO Unlock Reject
 */
export type IUnlockRejectPoResponseDto = z.infer<
  typeof UnlockRejectPoResponseSchema
>;

/**
 * PO Add
 */
export type IAddPoRequestDto = z.infer<typeof AddPoRequestSchema>;
export type IAddPoFormDto = z.input<typeof AddPoRequestSchema>;
export type IAddPoUIFormDto = Omit<
  IAddPoFormDto,
  'docType' | 'poFileKey' | 'poFileName'
> & {
  gstPercent: number;
  poAttachment: File[];
};
export type IAddPoResponseDto = z.infer<typeof AddPoResponseSchema>;

/**
 * PO Edit
 */
export type IEditPoRequestDto = z.infer<typeof EditPoRequestSchema>;
export type IEditPoFormDto = z.input<typeof EditPoRequestSchema>;
export type IEditPoUIFormDto = Omit<
  IEditPoFormDto,
  'docType' | 'poFileKey' | 'poFileName'
> & {
  gstPercent: number;
  poAttachment: File[];
  projectName: string;
  contractorName: string;
  vendorName: string;
};
export type IEditPoResponseDto = z.infer<typeof EditPoResponseSchema>;

/**
 * PO Dropdown
 */
export type IPoDropdownGetRequestDto = z.input<
  typeof PoDropdownGetRequestSchema
>;
export type IPoDropdownRecordDto = z.infer<typeof PoDropdownRecordSchema>;
export type IPoDropdownGetResponseDto = z.infer<
  typeof PoDropdownGetResponseSchema
>;
