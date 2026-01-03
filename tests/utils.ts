export const emptyText = '';

export const bigText = (length: number = 256): string => {
  return 'a'.repeat(length);
};

export const parseDatesFromJSON = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any,
  dateFields: (keyof T)[]
): T => {
  const result = { ...json };
  for (const field of dateFields) {
    if (result[field]) {
      result[field] = new Date(result[field]);
    }
  }
  return result as T;
};
