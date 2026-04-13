type T = (key: string) => string;

export const employmentLabels: Record<string, string> = {
  FULL_TIME: 'دوام كامل',
  PART_TIME: 'دوام جزئي',
  TEMPORARY: 'مؤقت',
  CONTRACT: 'عقد',
};

export const employmentOptions = [
  { value: 'FULL_TIME', label: 'دوام كامل' },
  { value: 'PART_TIME', label: 'دوام جزئي' },
  { value: 'TEMPORARY', label: 'مؤقت' },
  { value: 'CONTRACT', label: 'عقد' },
];

export function employmentLabelsT(t: T): Record<string, string> {
  return { FULL_TIME: t('fullTime'), PART_TIME: t('partTime'), TEMPORARY: t('temporary'), CONTRACT: t('contract') };
}

export function employmentOptionsT(t: T) {
  return Object.entries(employmentLabelsT(t)).map(([value, label]) => ({ value, label }));
}
