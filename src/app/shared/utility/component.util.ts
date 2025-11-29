export const getOriginalDataForSelectedRows = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TMapped extends Record<string, any>,
  TOriginal extends Record<string, unknown>,
>(
  selectedRows: TMapped[],
  originalData: TOriginal[],
  idField: keyof TMapped & keyof TOriginal = 'id' as keyof TMapped &
    keyof TOriginal
): TOriginal[] => {
  const selectedIds = selectedRows.map(row => row[idField]);
  return originalData.filter(record =>
    selectedIds.includes(record[idField] as never)
  );
};
