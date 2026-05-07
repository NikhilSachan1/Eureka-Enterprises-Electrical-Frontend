import z from 'zod';

const HolidaysBaseSchema = z.looseObject({
  name: z.string(),
  date: z.string(),
  daysUntil: z.number().int().nonnegative(),
});

export const HolidaysDashboardGetResponseSchema = z
  .looseObject({
    thisMonth: z.array(HolidaysBaseSchema),
    today: z.array(HolidaysBaseSchema),
    upcoming: z.array(HolidaysBaseSchema),
  })
  .transform(data => {
    return [...data.thisMonth, ...data.today, ...data.upcoming];
  });
