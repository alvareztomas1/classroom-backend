import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class TokenExpiredException extends HttpException {
  constructor(
    objectOrError: string = 'TokenExpired',
    descriptionOrOptions: string | HttpExceptionOptions = 'TokenExpired',
  ) {
    const { description, httpExceptionOptions } =
      HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
    super(
      HttpException.createBody(
        objectOrError,
        description ?? objectOrError,
        HttpStatus.UNAUTHORIZED,
      ),
      HttpStatus.UNAUTHORIZED,
      httpExceptionOptions,
    );
  }
}
