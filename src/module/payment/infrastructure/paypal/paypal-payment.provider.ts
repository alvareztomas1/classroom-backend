import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Configuration,
  Environment,
  LogLevel,
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
import { PAYMENT_ORDER_CREATION_FAIL } from '@payment/infrastructure/paypal/exception/paypal-payment-provider-error.messages';
import { PaymentProviderStorage } from '@payment/infrastructure/storage/payment-provider.storage';

@Injectable()
export class PaypalPaymentProvider
  extends BasePaymentProvider
  implements IPaymentProvider
{
  private readonly client: Client;
  private readonly environment: ENVIRONMENT;
  private readonly orderController: OrdersController;

  constructor(
    private readonly paymentProviderStorage: PaymentProviderStorage,
    configService: ConfigService,
  ) {
    super(configService);
    this.paymentProviderStorage.add(PaymentMethod.PayPal, this);
    this.environment =
      this.configService.get<ENVIRONMENT>('server.environment')!;
    this.client = new Client(this.getClientConfig());
    this.orderController = new OrdersController(this.client);
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

  private getClientConfig(): Configuration {
    const isProduction = this.environment === ENVIRONMENT.PRODUCTION;

    return {
      clientCredentialsAuthCredentials: {
        oAuthClientId: this.configService.get<string>('paypal.clientId')!,
        oAuthClientSecret: this.configService.get<string>(
          'paypal.clientSecret',
        )!,
      },
      timeout: isProduction ? 5000 : 0,
      environment: this.getPaypalEnvironment(this.environment),
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
