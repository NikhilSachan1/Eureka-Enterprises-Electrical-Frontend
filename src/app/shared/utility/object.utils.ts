export const deepMerge = (target: any, source: any): any => {
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
      result[key] = deepMerge(target[key], source[key]);
    } else {
      // For arrays and primitive values, replace completely
      result[key] = source[key];
    }
  }

  return result;
}

export const getDataFromArrayOfObjects = <T, K extends keyof T>(obj: T[], key: K): T[K][] => {
  return obj.map((item: T) => item[key]);
}