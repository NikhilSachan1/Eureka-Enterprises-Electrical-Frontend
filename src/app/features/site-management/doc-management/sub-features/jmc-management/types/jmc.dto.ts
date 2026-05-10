import { z } from 'zod';
import {
  AddJmcRequestSchema,
  AddJmcResponseSchema,
  EditJmcRequestSchema,
  EditJmcResponseSchema,
  ApproveJmcRequestSchema,
  ApproveJmcResponseSchema,
  DeleteJmcResponseSchema,
  JmcDetailGetResponseSchema,
  JmcGetBaseResponseSchema,
  JmcGetRequestSchema,
  JmcGetResponseSchema,
  RejectJmcRequestSchema,
  RejectJmcResponseSchema,
  UnlockGrantJmcResponseSchema,
  UnlockRejectJmcResponseSchema,
  UnlockRequestJmcRequestSchema,
  UnlockRequestJmcResponseSchema,
} from '../schemas';
import { JmcDetailGetRequestSchema } from '../schemas/get-jmc-detail.schema';

/*
  JMC Get
*/

export type IJmcGetBaseResponseDto = z.infer<typeof JmcGetBaseResponseSchema>;
export type IJmcGetResponseDto = z.infer<typeof JmcGetResponseSchema>;
export type IJmcGetRequestDto = z.infer<typeof JmcGetRequestSchema>;
export type IJmcGetFormDto = z.input<typeof JmcGetRequestSchema>;

/*
  JMC Detail Get
*/
export type IJmcDetailGetResponseDto = z.infer<
  typeof JmcDetailGetResponseSchema
>;
export type IJmcDetailGetRequestDto = z.infer<typeof JmcDetailGetRequestSchema>;

/*
  JMC Approve
*/
export type IApproveJmcRequestDto = z.infer<typeof ApproveJmcRequestSchema>;
export type IApproveJmcFormDto = z.input<typeof ApproveJmcRequestSchema>;
export type IApproveJmcResponseDto = z.infer<typeof ApproveJmcResponseSchema>;

/*
  JMC Reject
*/
export type IRejectJmcRequestDto = z.infer<typeof RejectJmcRequestSchema>;
export type IRejectJmcFormDto = z.input<typeof RejectJmcRequestSchema>;
export type IRejectJmcResponseDto = z.infer<typeof RejectJmcResponseSchema>;

/*
  JMC Unlock Request
*/
export type IUnlockRequestJmcRequestDto = z.infer<
  typeof UnlockRequestJmcRequestSchema
>;
export type IUnlockRequestJmcFormDto = z.input<
  typeof UnlockRequestJmcRequestSchema
>;
export type IUnlockRequestJmcResponseDto = z.infer<
  typeof UnlockRequestJmcResponseSchema
>;

/*
  JMC Unlock Grant
*/
export type IUnlockGrantJmcResponseDto = z.infer<
  typeof UnlockGrantJmcResponseSchema
>;

/*
  JMC Delete
*/
export type IDeleteJmcResponseDto = z.infer<typeof DeleteJmcResponseSchema>;

/**
 * JMC Unlock Reject
 */
export type IUnlockRejectJmcResponseDto = z.infer<
  typeof UnlockRejectJmcResponseSchema
>;

/**
 * JMC Add
 */
export type IAddJmcRequestDto = z.infer<typeof AddJmcRequestSchema>;
export type IAddJmcFormDto = z.input<typeof AddJmcRequestSchema>;
export type IAddJmcUIFormDto = Omit<
  IAddJmcFormDto,
  'docType' | 'jmcFileKey' | 'jmcFileName'
> & {
  gstPercent: number;
  jmcAttachment: File[];
};
export type IAddJmcResponseDto = z.infer<typeof AddJmcResponseSchema>;

/**
 * JMC Edit
 */
export type IEditJmcRequestDto = z.infer<typeof EditJmcRequestSchema>;
export type IEditJmcFormDto = z.input<typeof EditJmcRequestSchema>;
export type IEditJmcUIFormDto = Omit<
  IEditJmcFormDto,
  'docType' | 'jmcFileKey' | 'jmcFileName'
> & {
  gstPercent: number;
  jmcAttachment: File[];
  projectName: string;
  contractorName: string;
  vendorName: string;
};
export type IEditJmcResponseDto = z.infer<typeof EditJmcResponseSchema>;
