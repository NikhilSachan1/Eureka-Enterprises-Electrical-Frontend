export const deepMerge = <T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };

  for (const key in source) {
    // Check if both values exist and are objects, but NOT arrays
    if (
      source[key] instanceof Object &&
      key in target &&
      target[key] instanceof Object &&
      !Array.isArray(source[key]) &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else {
      // For arrays and primitive values, replace completely
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return result;
};

export const getDataFromArrayOfObjects = <T, K extends keyof T>(
  obj: T[],
  key: K
): T[K][] => {
  return obj.map((item: T) => item[key]);
};
