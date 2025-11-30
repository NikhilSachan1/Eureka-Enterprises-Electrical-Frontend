import z from 'zod';

export const makeFieldsNullable = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): z.ZodObject<{ [K in keyof T]: z.ZodNullable<T[K]> }> => {
  const { shape } = schema;
  const nullableShape = Object.entries(shape).reduce(
    (acc, [key, value]) => {
      acc[key] = (value as z.ZodTypeAny).nullable();
      return acc;
    },
    {} as Record<string, z.ZodTypeAny>
  );
  return z.object(nullableShape) as z.ZodObject<{
    [K in keyof T]: z.ZodNullable<T[K]>;
  }>;
};
