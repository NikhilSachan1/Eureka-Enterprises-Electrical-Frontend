import { z } from 'zod';

export const uuidField = z.uuid();
export const isoDateTimeField = z.iso.datetime();
export const dateField = z.date();
