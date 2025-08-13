import { InternalServerErrorException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CheckoutPaymentIntent,
  Client,
  CustomError,
  Environment,
  LogLevel,
  OrderApplicationContextUserAction,
  OrdersController,
} from '@paypal/paypal-server-sdk';
import { HttpContext } from '@paypal/paypal-server-sdk/dist/types/core';

import { setupApp } from '@config/app.config';

import { IBuyer } from '@payment/application/service/payment-service.interface';
import { PAYMENT_ORDER_CREATION_FAIL } from '@payment/infrastructure/paypal/exception/paypal-payment-provider-error.messages';
import { PaypalPaymentProvider } from '@payment/infrastructure/paypal/paypal-payment.provider';

import { AppModule } from '@module/app.module';

const clientId = 'mock-client-id';
const clientSecret = 'mock-client-secret';
const mockOrderId = 'mock-order-id';
const mockApproveUrl = 'mock-approve-url';
const mockClient = jest.fn();
const mockOrdersController = {
  createOrder: jest.fn(() => ({
    result: {
      id: mockOrderId,
      links: [
        {
          href: mockApproveUrl,
          rel: 'approve',
        },
      ],
    },
  })),
};

jest.mock('@paypal/paypal-server-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual('@paypal/paypal-server-sdk');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    Client: jest.fn(() => mockClient),
    OrdersController: jest.fn().mockImplementation(() => mockOrdersController),
  };
});

describe('PaypalPaymentProvider', () => {
  let app: NestExpressApplication;
  let paypalPaymentProvider: PaypalPaymentProvider;

  beforeAll(async () => {
    process.env.PAYPAL_CLIENT_ID = clientId;
    process.env.PAYPAL_CLIENT_SECRET = clientSecret;

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();

    setupApp(app);
    await app.init();

    paypalPaymentProvider = moduleRef.get<PaypalPaymentProvider>(
      PaypalPaymentProvider,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Constructor', () => {
    it('Should define the paypal payment provider with the correct config', () => {
      expect(paypalPaymentProvider).toBeDefined();
      expect(Client).toHaveBeenCalledTimes(1);
      expect(Client).toHaveBeenCalledWith({
        clientCredentialsAuthCredentials: {
          oAuthClientId: clientId,
          oAuthClientSecret: clientSecret,
        },
        timeout: 0,
        environment: Environment.Sandbox,
        logging: {
          logLevel: LogLevel.Info,
          logRequest: {
            logBody: true,
          },
          logResponse: {
            logHeaders: true,
          },
        },
      });
      expect(OrdersController).toHaveBeenCalledTimes(1);
      expect(OrdersController).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('createPaymentOrder', () => {
    const amount = 10;
    const currency = 'USD';
    const buyer: IBuyer = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'Fwz3P@example.com',
    };

    it('Should create a payment order', async () => {
      const expectedCollect = {
        body: {
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
              givenName: buyer.firstName,
              surname: buyer.lastName,
            },
            emailAddress: buyer.email,
          },
          applicationContext: {
            brandName: 'Classroom',
            userAction: OrderApplicationContextUserAction.PayNow,
            returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
            cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
          },
        },
        prefer: 'return=minimal',
      };

      const result = await paypalPaymentProvider.createPaymentOrder(
        currency,
        amount,
        buyer,
      );

      expect(result.paymentOrderId).toBe(mockOrderId);
      expect(result.approveUrl).toBe(mockApproveUrl);

      expect(mockOrdersController.createOrder).toHaveBeenCalledTimes(1);
      expect(mockOrdersController.createOrder).toHaveBeenCalledWith(
        expectedCollect,
      );
    });

    it('Should throw the error received from paypal', async () => {
      const error = new CustomError(
        {
          request: {
            method: 'POST',
            url: 'https://api-m.sandbox.paypal.com/v2/orders',
          },
          response: {
            statusCode: 400,
            body: 'Paypal error',
          },
        } as HttpContext,
        'Paypal error',
      );
      (mockOrdersController.createOrder as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(
        paypalPaymentProvider.createPaymentOrder(currency, amount, buyer),
      ).rejects.toThrow(error);
    });

    it('Should throw a default error when receiving an unexpected error', async () => {
      const error = new Error('Paypal error');
      (mockOrdersController.createOrder as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(
        paypalPaymentProvider.createPaymentOrder(currency, amount, buyer),
      ).rejects.toThrow(
        new InternalServerErrorException(PAYMENT_ORDER_CREATION_FAIL),
      );
    });
  });
});
