export class MBTransformer {
  static toMB(value: number): number {
    return value / 1024 / 1024;
  }
}
