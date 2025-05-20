import { ValueTransformer } from 'typeorm';

export class ArrayTransformer implements ValueTransformer {
  to(value: string[]): string {
    if (Array.isArray(value)) {
      return value.join(',');
    }
    return value;
  }

  from(value: string): string[] {
    return value ? value.split(',') : [];
  }
}
