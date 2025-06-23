import {
  FileFormat,
  ImageFormat,
} from '@common/base/application/enum/file-format.enum';

const OPTIMAL_SIZES = {
  IMAGE: 20 * 1024 * 1024,
  SVG: 5 * 1024 * 1024,
  PDF: 50 * 1024 * 1024,
  VIDEO: 1 * 1024 * 1024 * 1024,
};

export const MAX_FILE_SIZES = {
  [FileFormat.PDF]: OPTIMAL_SIZES.PDF,
  [FileFormat.MP4]: OPTIMAL_SIZES.VIDEO,
  [ImageFormat.SVG]: OPTIMAL_SIZES.SVG,
  ...Object.fromEntries(
    [
      ImageFormat.JPEG,
      ImageFormat.JPG,
      ImageFormat.PNG,
      ImageFormat.WEBP,
      ImageFormat.AVIF,
    ].map((format) => [format, OPTIMAL_SIZES.IMAGE]),
  ),
};

export const MIME_FILE_TYPE_MAP = {
  [FileFormat.PDF]: 'application/pdf',
  [FileFormat.MP4]: 'video/mp4',
};

export const MIME_IMAGE_TYPE_MAP = {
  [ImageFormat.SVG]: 'image/svg+xml',
  ...Object.fromEntries(
    [
      ImageFormat.JPEG,
      ImageFormat.JPG,
      ImageFormat.PNG,
      ImageFormat.WEBP,
      ImageFormat.AVIF,
    ].map((format) => [format, `image/${format}`]),
  ),
};
