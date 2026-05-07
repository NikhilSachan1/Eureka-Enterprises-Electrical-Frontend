import z from 'zod';

const AnniversariesBaseSchema = z.looseObject({
  name: z.string(),
  date: z.string(),
  daysUntil: z.number().int().nonnegative(),
  profilePicture: z.string(),
  yearsCompleted: z.number().int().nonnegative(),
});

export const AnniversariesDashboardGetResponseSchema = z
  .looseObject({
    today: z.array(AnniversariesBaseSchema),
    thisWeek: z.array(AnniversariesBaseSchema),
  })
  .transform(data => {
    return [...data.today, ...data.thisWeek];
  });
