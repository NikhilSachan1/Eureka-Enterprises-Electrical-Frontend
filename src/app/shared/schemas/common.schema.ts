import { z } from 'zod';

export const uuidField = z.uuid();
export const isoDateTimeField = z.iso.datetime();
export const dateField = z.date();
export const onlyDateStringField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(val => !isNaN(new Date(val).getTime()), 'Invalid date');
export const onlyTimeStringField = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .refine(
    val => !isNaN(new Date(`1970-01-01T${val}`).getTime()),
    'Invalid time'
  );
export const fileField = z.instanceof(File);
