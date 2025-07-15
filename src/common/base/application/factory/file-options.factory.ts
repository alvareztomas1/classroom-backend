import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Request } from 'express';

import {
  MAX_FILE_SIZES,
  MIME_FILE_TYPE_MAP,
  MIME_IMAGE_TYPE_MAP,
} from '@common/base/application/constant/file.constant';
import {
  FileFormat,
  ImageFormat,
} from '@common/base/application/enum/file-format.enum';
import { FileTooLargeException } from '@common/base/application/factory/exception/file-to-large.exception';
import { WrongFormatException } from '@common/base/application/factory/exception/wrong-format.exception';
import { fromBytesToMB } from '@common/base/application/mapper/base.mapper';

type AllowedFormat = ImageFormat | FileFormat;

export class FileOptionsFactory implements MulterOptions {
  static create(type: string, formats: AllowedFormat[]): MulterOptions {
    const isImage = formats.some((format) =>
      Object.values(ImageFormat).includes(format as ImageFormat),
    );
    const allowedMimeTypes = formats.map((format) =>
      isImage
        ? MIME_IMAGE_TYPE_MAP[format as keyof typeof MIME_IMAGE_TYPE_MAP]
        : MIME_FILE_TYPE_MAP[format as keyof typeof MIME_FILE_TYPE_MAP],
    );
    const fileExtensions = formats.join(', .');
    const maxFileSize =
      Math.max(
        ...formats.map((format) => MAX_FILE_SIZES[format as FileFormat]),
      ) + 5;

    return {
      limits: {
        fileSize: maxFileSize,
      },
      fileFilter: (req: Request, file, cb): void => {
        const isValidMime = allowedMimeTypes.includes(file.mimetype);
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

        if (
          !isValidMime ||
          !fileExtension ||
          !formats.includes(fileExtension as FileFormat)
        ) {
          return cb(
            new WrongFormatException({
              message: `File "${file.originalname}" is invalid. Only .${fileExtensions} formats are allowed for ${type} field.`,
            }),
            false,
          );
        }

        const maxSize = MAX_FILE_SIZES[fileExtension as FileFormat];
        const fileSize = parseInt(req.headers['content-length'] || '0', 10);

        if (fileSize > maxSize) {
          return cb(
            new FileTooLargeException({
              message: `File "${file.originalname}" exceeds the maximum size of ${fromBytesToMB(maxSize).toFixed(1)} MB.`,
            }),
            false,
          );
        }

        cb(null, true);
      },
    };
  }
}
