import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private currentRequestUrl: string;

  public setCurrentRequestUrl(endpoint: string): void {
    this.currentRequestUrl = endpoint;
  }

  public getCurrentRequestUrl(): string {
    return this.currentRequestUrl;
  }
}
