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
    // The lists overlap: a holiday can be in today, upcoming and thisMonth at once.
    const holidays = [...data.today, ...data.upcoming, ...data.thisMonth];
    const uniqueHolidays = new Map(
      holidays.map(holiday => [`${holiday.date}|${holiday.name}`, holiday])
    );

    return [...uniqueHolidays.values()].sort(
      (a, b) => a.daysUntil - b.daysUntil
    );
  });
