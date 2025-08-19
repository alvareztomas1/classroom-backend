import { HttpService } from '@nestjs/axios';
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

import { PaypalApiUrl } from '@paypal/application/enum/paypal-api.enum';
import { PayPalWebhookEvent } from '@paypal/application/enum/paypal-webhook-event.enum';
import { IPaypalWebhookVerifyPayload } from '@paypal/application/interface/paypal-webhook-body.interface';
import {
  ACCESS_TOKEN_ERROR,
  PAYMENT_ORDER_CAPTURE_FAIL,
  PAYMENT_ORDER_CREATION_FAIL,
  WEBHOOK_VERIFICATION_ERROR,
} from '@paypal/infrastructure/exception/paypal-exception.messages';
import { PaypalPaymentProvider } from '@paypal/infrastructure/provider/paypal-payment.provider';

import { AppModule } from '@module/app.module';

const clientId = 'mock-client-id';
const clientSecret = 'mock-client-secret';
const mockOrderId = 'mock-order-id';
const mockApproveUrl = 'mock-approve-url';
const mockAccessToken = 'mock-access-token';
const mockClient = {
  clientCredentialsAuthManager: {
    fetchToken: jest.fn(() => ({ accessToken: mockAccessToken })),
  },
};
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
  captureOrder: jest.fn(() => ({
    result: {
      id: mockOrderId,
    },
  })),
};
const mockHttpService = {
  axiosRef: {
    post: jest.fn(),
  },
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
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .compile();
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

  describe('capturePaymentOrder', () => {
    it('Should capture a payment order', async () => {
      const result =
        await paypalPaymentProvider.capturePaymentOrder(mockOrderId);

      expect(mockOrdersController.captureOrder).toHaveBeenCalledTimes(1);
      expect(mockOrdersController.captureOrder).toHaveBeenCalledWith({
        id: mockOrderId,
      });
      expect(result).toEqual({
        id: mockOrderId,
      });
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
      (mockOrdersController.captureOrder as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(
        paypalPaymentProvider.capturePaymentOrder(mockOrderId),
      ).rejects.toThrow(error);
    });

    it('Should throw a default error when receiving an unexpected error', async () => {
      const error = new Error('Paypal error');
      (mockOrdersController.captureOrder as jest.Mock).mockRejectedValueOnce(
        error,
      );

      await expect(
        paypalPaymentProvider.capturePaymentOrder(mockOrderId),
      ).rejects.toThrow(
        new InternalServerErrorException(PAYMENT_ORDER_CAPTURE_FAIL),
      );
    });
  });

  describe('getAccessToken', () => {
    it('Should return access token when successful', async () => {
      const result = await paypalPaymentProvider.getAccessToken();
      expect(result).toBe(mockAccessToken);
      expect(
        mockClient.clientCredentialsAuthManager.fetchToken,
      ).toHaveBeenCalledTimes(1);
    });

    it('Should throw ApiError when PayPal API returns error', async () => {
      const apiError = new CustomError(
        {
          request: {
            method: 'POST',
            url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
          },
          response: {
            statusCode: 400,
            body: 'Invalid credentials',
          },
        } as HttpContext,
        'Invalid credentials',
      );

      (
        mockClient.clientCredentialsAuthManager.fetchToken as jest.Mock
      ).mockRejectedValueOnce(apiError);

      await expect(paypalPaymentProvider.getAccessToken()).rejects.toThrow(
        apiError,
      );
      expect(
        mockClient.clientCredentialsAuthManager.fetchToken,
      ).toHaveBeenCalledTimes(1);
    });

    it('Should throw the paypal error when token request fails', async () => {
      const error = new CustomError(
        {
          request: {
            method: 'POST',
            url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
          },
          response: {
            statusCode: 400,
            body: 'Paypal error',
          },
        } as HttpContext,
        'Paypal error',
      );
      (
        mockClient.clientCredentialsAuthManager.fetchToken as jest.Mock
      ).mockRejectedValueOnce(error);

      await expect(paypalPaymentProvider.getAccessToken()).rejects.toThrow(
        error,
      );
      expect(
        mockClient.clientCredentialsAuthManager.fetchToken,
      ).toHaveBeenCalledTimes(1);
    });

    it('Should throw InternalServerErrorException for unexpected errors', async () => {
      const unexpectedError = new Error('Network error');
      (
        mockClient.clientCredentialsAuthManager.fetchToken as jest.Mock
      ).mockRejectedValueOnce(unexpectedError);

      await expect(paypalPaymentProvider.getAccessToken()).rejects.toThrow(
        new InternalServerErrorException(ACCESS_TOKEN_ERROR),
      );
      expect(
        mockClient.clientCredentialsAuthManager.fetchToken,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyWebhookSignature', () => {
    const mockAccessToken = 'mock-access-token';
    const mockPayload: IPaypalWebhookVerifyPayload = {
      auth_algo: 'SHA256',
      cert_url: 'https://api.sandbox.paypal.com/cert.pem',
      transmission_id: 'trans-123',
      transmission_sig: 'signature-abc',
      transmission_time: '2023-01-01T00:00:00Z',
      webhook_id: 'webhook-123',
      webhook_event: {
        event_type: PayPalWebhookEvent.PaymentCaptureCompleted,
        resource: { id: 'order-123', status: 'COMPLETED' },
      },
    };

    it('Should return true when verification succeeds', async () => {
      mockHttpService.axiosRef.post.mockResolvedValueOnce({
        data: { verification_status: 'SUCCESS' },
      });

      const result = await paypalPaymentProvider.verifyWebhookSignature(
        mockAccessToken,
        mockPayload,
      );
      expect(result).toBe(true);
      expect(mockHttpService.axiosRef.post).toHaveBeenCalledWith(
        `${PaypalApiUrl.Sandbox}/notifications/verify-webhook-signature`,
        mockPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
        },
      );
    });

    it('Should return false when verification fails', async () => {
      mockHttpService.axiosRef.post.mockResolvedValueOnce({
        data: { verification_status: 'FAILURE' },
      });

      const result = await paypalPaymentProvider.verifyWebhookSignature(
        mockAccessToken,
        mockPayload,
      );
      expect(result).toBe(false);
    });

    it('Should throw the paypal error when verification request fails', async () => {
      const error = new CustomError(
        {
          request: {
            method: 'POST',
            url: 'https://api-m.sandbox.paypal.com/v2/notifications/verify-webhook-signature',
          },
          response: {
            statusCode: 400,
            body: 'Paypal error',
          },
        } as HttpContext,
        'Paypal error',
      );
      mockHttpService.axiosRef.post.mockRejectedValueOnce(error);

      await expect(
        paypalPaymentProvider.verifyWebhookSignature(
          mockAccessToken,
          mockPayload,
        ),
      ).rejects.toThrow(error);
    });

    it('Should throw InternalServerErrorException when verification request fails', async () => {
      const error = new Error('Network error');
      mockHttpService.axiosRef.post.mockRejectedValueOnce(error);

      await expect(
        paypalPaymentProvider.verifyWebhookSignature(
          mockAccessToken,
          mockPayload,
        ),
      ).rejects.toThrow(
        new InternalServerErrorException(
          `${WEBHOOK_VERIFICATION_ERROR} - ${error.message}`,
        ),
      );
    });
  });
});
