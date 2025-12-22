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

export const getMappedValueFromArrayOfObjects = <
  T,
  SearchKey extends keyof T = 'value' & keyof T,
  ReturnKey extends keyof T = 'label' & keyof T,
>(
  list: T[],
  searchValue: T[SearchKey],
  searchKey: SearchKey = 'value' as unknown as SearchKey,
  returnKey: ReturnKey = 'label' as unknown as ReturnKey
): T[ReturnKey] | T[SearchKey] => {
  const match = list.find((item: T) => item[searchKey] === searchValue);
  const returnValue = match?.[returnKey];
  return (returnValue ?? searchValue) as T[ReturnKey] | T[SearchKey];
};
