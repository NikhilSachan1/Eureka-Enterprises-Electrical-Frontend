import { FinancialYearService } from '@core/services/financial-year.service';
import { uuidField } from '@shared/schemas';
import z from 'zod';

export const LeaveBalanceGetRequestSchema = z
  .object({
    employeeName: uuidField.optional(),
  })
  .strict()
  .transform(({ employeeName }) => {
    return {
      employeeName,
      financialYear: new FinancialYearService().getFinancialYear(),
    };
  });

export const LeaveBalanceGetBaseResponseSchema = z.looseObject({
  totalAllocated: z.string(),
  consumed: z.string(),
  balance: z.string(),
});

export const LeaveBalanceGetResponseSchema = z.looseObject({
  records: z.array(LeaveBalanceGetBaseResponseSchema),
});
