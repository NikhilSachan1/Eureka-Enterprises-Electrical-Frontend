import z from 'zod';

const BirthdaysBaseSchema = z.looseObject({
  name: z.string(),
  date: z.string(),
  daysUntil: z.number().int().nonnegative(),
  profilePicture: z.string(),
});

export const BirthdaysDashboardGetResponseSchema = z
  .looseObject({
    today: z.array(BirthdaysBaseSchema),
    thisWeek: z.array(BirthdaysBaseSchema),
  })
  .transform(data => {
    return [...data.today, ...data.thisWeek];
  });
