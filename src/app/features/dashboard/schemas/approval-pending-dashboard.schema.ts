import z from 'zod';

const ApprovalPendingQueueSchema = z.looseObject({
  key: z.string(),
  label: z.string(),
  total: z.number().nonnegative().default(0),
  pending: z.number().nonnegative().default(0),
  onMe: z.number().nonnegative().default(0),
  raisedByMe: z.number().nonnegative().default(0),
  oldestDays: z.number().nonnegative().default(0),
  iApprove: z.boolean().default(false),
});

export const ApprovalPendingDashboardGetResponseSchema = z.looseObject({
  scope: z.string().optional(),
  totals: z
    .looseObject({
      pending: z.number().nonnegative().default(0),
      onMe: z.number().nonnegative().default(0),
      raisedByMe: z.number().nonnegative().default(0),
    })
    .optional(),
  queues: z.array(ApprovalPendingQueueSchema).default([]),
});
