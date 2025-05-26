export interface ISlugService {
  buildSlug(text: string): string;
  buildUniqueSlug(baseText: string, existingSlugs: string[]): string;
}
