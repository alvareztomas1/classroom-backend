import { Injectable } from '@nestjs/common';
import slugify from 'slugify';

import { ISlugService } from '@app/application/service/slug-service.interface';

@Injectable()
export class SlugService implements ISlugService {
  private readonly slugOptions = {
    lower: true,
    strict: true,
    trim: true,
  };

  constructor() {}

  public buildSlug(text: string): string {
    return slugify(text, this.slugOptions);
  }

  public buildUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    if (!this.slugExists(baseSlug, existingSlugs)) {
      return baseSlug;
    }

    const nextSuffix = this.calculateNextSuffix(baseSlug, existingSlugs);
    return `${baseSlug}-${nextSuffix}`;
  }

  private slugExists(slug: string, existingSlugs: string[]): boolean {
    return existingSlugs.includes(slug);
  }

  private calculateNextSuffix(
    baseSlug: string,
    existingSlugs: string[],
  ): number {
    const suffixPattern = new RegExp(`^${baseSlug}-(\\d+)$`);
    const suffixes = existingSlugs
      .map((slug) => {
        const match = slug.match(suffixPattern);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);

    return suffixes.length > 0 ? Math.max(...suffixes) + 1 : 2;
  }
}
