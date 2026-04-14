type T = (key: string) => string;

export function employmentLabelsT(t: T): Record<string, string> {
  return { FULL_TIME: t('fullTime'), PART_TIME: t('partTime'), TEMPORARY: t('temporary'), CONTRACT: t('contract') };
}

export function employmentOptionsT(t: T) {
  return Object.entries(employmentLabelsT(t)).map(([value, label]) => ({ value, label }));
}
