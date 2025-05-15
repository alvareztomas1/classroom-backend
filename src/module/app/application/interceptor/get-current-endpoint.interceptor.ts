import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { AppService } from '@module/app/application/service/app.service';

@Injectable()
export class GetCurrentEndpointInterceptor implements NestInterceptor {
  constructor(private readonly appService: AppService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const host = request.headers.host;
    const endpointUrl = `${request.protocol}://${host}${request.url}`;
    this.appService.setCurrentRequestUrl(endpointUrl);
    return next.handle();
  }
}
