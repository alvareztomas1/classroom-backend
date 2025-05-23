import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { WrongFormatException } from '@common/base/application/factory/exception/wrong-format.exception';

export enum ImageFormat {
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  WEBP = 'webp',
  SVG = 'svg',
  AVIF = 'avif',
}

const DEFAULT_FORMATS = Object.values(ImageFormat);
const DEFAULT_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

export class ImageOptionsFactory implements MulterOptions {
  static create(
    type: string,
    formats: ImageFormat[] = DEFAULT_FORMATS,
    size: number = DEFAULT_IMAGE_MAX_SIZE,
  ): MulterOptions {
    const mimeRegex = new RegExp(`^image/(${formats.join('|')})$`, 'i');
    return {
      limits: {
        fileSize: size,
      },
      fileFilter: (req, file, cb): void => {
        const isValid = mimeRegex.test(file.mimetype);

        if (!isValid) {
          return cb(
            new WrongFormatException({
              message: `Only .${formats.join(', .')} formats are allowed for ${type} image`,
            }),
            false,
          );
        }
        cb(null, true);
      },
    };
  }
}
