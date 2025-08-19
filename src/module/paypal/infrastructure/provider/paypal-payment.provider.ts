import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Configuration,
  Environment,
  LogLevel,
  Order,
  OrderApplicationContextUserAction,
  OrderRequest,
  OrdersController,
} from '@paypal/paypal-server-sdk';

import { ENVIRONMENT } from '@config/environment.enum';

import BasePaymentProvider from '@common/base/infrastructure/payment/base-payment.provider';

import { IPaymentOrderResponse } from '@payment/application/interface/payment-order-response.interface';
import { IPaymentProvider } from '@payment/application/interface/payment-provider.interface';
import { IBuyer } from '@payment/application/service/payment-service.interface';
import { PaymentMethod } from '@payment/domain/payment-method.enum';
import { PaymentProviderStorage } from '@payment/infrastructure/storage/payment-provider.storage';

import { PaypalApiUrl } from '@paypal/application/enum/paypal-api.enum';
import { IPaypalWebhookVerifyPayload } from '@paypal/application/interface/paypal-webhook-body.interface';
import { IPaypalVerifySignatureResponse } from '@paypal/application/interface/paypal-webhook-responses.interface';
import {
  ACCESS_TOKEN_ERROR,
  PAYMENT_ORDER_CAPTURE_FAIL,
  PAYMENT_ORDER_CREATION_FAIL,
  WEBHOOK_VERIFICATION_ERROR,
} from '@paypal/infrastructure/exception/paypal-exception.messages';

@Injectable()
export class PaypalPaymentProvider
  extends BasePaymentProvider
  implements IPaymentProvider
{
  private readonly client: Client;
  private readonly environment: Environment;
  private readonly orderController: OrdersController;
  private paypalApiUrl: PaypalApiUrl;

  constructor(
    private readonly paymentProviderStorage: PaymentProviderStorage,
    configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super(configService);
    this.paymentProviderStorage.add(PaymentMethod.PayPal, this);
    this.environment = this.getPaypalEnvironment(
      this.configService.get<ENVIRONMENT>('server.environment')!,
    );
    this.client = new Client(this.getClientConfig());
    this.paypalApiUrl = this.getApiUrl();
    this.orderController = new OrdersController(this.client);
  }

  async getAccessToken(): Promise<string> {
    try {
      const { accessToken } =
        await this.client.clientCredentialsAuthManager.fetchToken();

      return accessToken;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new InternalServerErrorException(ACCESS_TOKEN_ERROR);
    }
  }

  async verifyWebhookSignature(
    accessToken: string,
    payload: IPaypalWebhookVerifyPayload,
  ): Promise<boolean> {
    try {
      const { data } =
        await this.httpService.axiosRef.post<IPaypalVerifySignatureResponse>(
          `${this.paypalApiUrl}/notifications/verify-webhook-signature`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

      return data.verification_status === 'SUCCESS';
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new InternalServerErrorException(
        `${WEBHOOK_VERIFICATION_ERROR} - ${(error as Error).message}`,
      );
    }
  }

  async createPaymentOrder(
    currency: string,
    amount: number,
    buyer?: IBuyer,
  ): Promise<IPaymentOrderResponse> {
    const collect = {
      body: this.buildOrderRequest(currency, amount, buyer),
      prefer: 'return=minimal',
    };

    try {
      const { result } = await this.orderController.createOrder(collect);

      return {
        paymentOrderId: result.id!,
        approveUrl: result.links!.find((link) => link.rel === 'approve')?.href,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new InternalServerErrorException(PAYMENT_ORDER_CREATION_FAIL);
    }
  }

  async capturePaymentOrder(orderId: string): Promise<Order> {
    try {
      const { result } = await this.orderController.captureOrder({
        id: orderId,
      });

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new InternalServerErrorException(PAYMENT_ORDER_CAPTURE_FAIL);
    }
  }

  private getApiUrl(): PaypalApiUrl {
    const apiUrlMap = {
      [Environment.Production]: PaypalApiUrl.Production,
      [Environment.Sandbox]: PaypalApiUrl.Sandbox,
    };

    return apiUrlMap[this.environment];
  }

  private getClientConfig(): Configuration {
    const isProduction = this.environment === Environment.Production;

    return {
      clientCredentialsAuthCredentials: {
        oAuthClientId: this.configService.get<string>('paypal.clientId')!,
        oAuthClientSecret: this.configService.get<string>(
          'paypal.clientSecret',
        )!,
      },
      timeout: isProduction ? 5000 : 0,
      environment: this.environment,
      logging: {
        logLevel: isProduction ? LogLevel.Error : LogLevel.Info,
        logRequest: {
          logBody: !isProduction,
        },
        logResponse: {
          logHeaders: !isProduction,
        },
      },
    };
  }

  private getPaypalEnvironment(nodeEnvironment: ENVIRONMENT): Environment {
    const environmentMap: Record<ENVIRONMENT, Environment> = {
      [ENVIRONMENT.PRODUCTION]: Environment.Production,
      [ENVIRONMENT.STAGING]: Environment.Sandbox,
      [ENVIRONMENT.DEVELOPMENT]: Environment.Sandbox,
      [ENVIRONMENT.AUTOMATED_TESTS]: Environment.Sandbox,
    };

    return environmentMap[nodeEnvironment] ?? Environment.Sandbox;
  }

  private buildOrderRequest(
    currency: string,
    amount: number,
    buyer?: IBuyer,
  ): OrderRequest {
    return {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: currency,
            value: amount.toString(),
          },
        },
      ],
      payer: {
        name: {
          givenName: buyer?.firstName,
          surname: buyer?.lastName,
        },
        emailAddress: buyer?.email,
      },
      applicationContext: {
        brandName: 'Classroom',
        userAction: OrderApplicationContextUserAction.PayNow,
        returnUrl: this.returnUrl,
        cancelUrl: this.cancelUrl,
      },
    };
  }
}
