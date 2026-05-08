import z from 'zod';

const UserSchema = z.looseObject({
  firstName: z.string(),
  lastName: z.string(),
  net: z.number().default(0),
  status: z.enum(['payable', 'overpaid']),
});

export const LedgerBalanceDashboardGetResponseSchema = z
  .looseObject({
    expense: z.looseObject({
      balances: z.looseObject({
        opening: z.number().default(0),
        closing: z.number().default(0),
      }),
      payable: z.looseObject({
        totalAmount: z.number().default(0),
        employees: z.array(UserSchema),
      }),
      overpaid: z.looseObject({
        totalAmount: z.number().default(0),
        employees: z.array(UserSchema),
      }),
    }),
    fuel: z.looseObject({
      balances: z.looseObject({
        opening: z.number().default(0),
        closing: z.number().default(0),
      }),
      payable: z.looseObject({
        totalAmount: z.number().default(0),
        employees: z.array(UserSchema),
      }),
      overpaid: z.looseObject({
        totalAmount: z.number().default(0),
        employees: z.array(UserSchema),
      }),
    }),
  })
  .transform(data => ({
    expense: {
      balances: {
        opening: data.expense.balances.opening,
        closing: data.expense.balances.closing,
        eurekaOpening: 0,
        eurekaClosing: 0,
      },
      payable: {
        totalAmount: data.expense.payable.totalAmount,
      },
      overpaid: {
        totalAmount: data.expense.overpaid.totalAmount,
      },
      employees: [
        ...data.expense.payable.employees,
        ...data.expense.overpaid.employees,
      ],
    },
    fuel: {
      balances: {
        opening: data.fuel.balances.opening,
        closing: data.fuel.balances.closing,
        eurekaOpening: 0,
        eurekaClosing: 0,
      },
      payable: {
        totalAmount: data.fuel.payable.totalAmount,
      },
      overpaid: {
        totalAmount: data.fuel.overpaid.totalAmount,
      },
      employees: [
        ...data.fuel.payable.employees,
        ...data.fuel.overpaid.employees,
      ],
    },
  }));
