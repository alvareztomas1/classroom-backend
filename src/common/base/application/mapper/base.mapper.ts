export const fromCommaSeparatedToArray = (value: string): string[] => {
  return value.replace(/\s/g, '').split(',');
};

export const fromBytesToMB = (value: number): number => {
  return value / 1024 / 1024;
};

export const fromStringToKebabCase = (string: string): string => {
  if (!string || typeof string !== 'string') return '';

  return string
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const fromStringToSeparatedWords = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};
