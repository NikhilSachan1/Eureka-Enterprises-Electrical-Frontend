import { FinancialYearService } from '@core/services/financial-year.service';
import { uuidField } from '@shared/schemas';
import z from 'zod';

export const LeaveBalanceGetRequestSchema = z
  .object({
    employeeName: uuidField.optional(),
  })
  .strict()
  .transform(({ employeeName }) => {
    const financialYear = new FinancialYearService().getFinancialYear();
    if (employeeName) {
      return { userIds: [employeeName], financialYear };
    }
    return { financialYear };
  });

export const LeaveBalanceGetBaseResponseSchema = z.looseObject({
  id: z.string().optional(),
  userId: z.string().optional(),
  leaveCategory: z.string().optional(),
  financialYear: z.string().optional(),
  totalAllocated: z.string(),
  consumed: z.string(),
  availableBalance: z.string(),
  user: z
    .looseObject({
      id: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      employeeId: z.string().optional(),
    })
    .optional(),
});

export const LeaveBalanceGetResponseSchema = z.looseObject({
  records: z.array(LeaveBalanceGetBaseResponseSchema),
});
