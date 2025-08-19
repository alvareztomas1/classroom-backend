/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IncomingHttpHeaders } from 'http';
import request from 'supertest';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { loadFixtures } from '@data/util/fixture-loader';

import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { PayPalWebhookEvent } from '@paypal/application/enum/paypal-webhook-event.enum';
import {
  IPayPalCaptureResource,
  IPayPalOrderResource,
  IPaypalWebhookBody,
} from '@paypal/application/interface/paypal-webhook-body.interface';
import { IPayPalWebhookHeaders } from '@paypal/application/interface/paypal-webhook-headers.interface';
import { WEBHOOK_EVENT_NAME } from '@paypal/domain/webhook-name';
import { INVALID_PAYPAL_WEBHOOK } from '@paypal/infrastructure/exception/paypal-exception.messages';

import {
  IPurchaseRepository,
  PURCHASE_REPOSITORY_KEY,
} from '@purchase/application/repository/purchase-repository.interface';
import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

import {
  paypalPaymentProviderMock,
  testModuleBootstrapper,
} from '@test/test.module.bootstrapper';

describe('Paypal E2E tests', () => {
  let app: NestExpressApplication;
  let purchaseRepository: IPurchaseRepository;

  beforeAll(async () => {
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication({ logger: false });
    setupApp(app);
    await app.init();

    purchaseRepository = app.get<IPurchaseRepository>(PURCHASE_REPOSITORY_KEY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const endpoint = '/api/v1/paypal';

  const mockPaypalHeaders = {
    'paypal-auth-algorithm': 'HMAC-SHA256',
    'paypal-auth-authorization': 'mock-authorization',
    'paypal-auth-timestamp': 'mock-timestamp',
    'paypal-auth-signature': 'mock-signature',
    'paypal-auth-algo': 'HMAC-SHA256',
    'paypal-cert-url': 'mock-cert-url',
    'paypal-transmission-id': 'mock-transmission-id',
    'paypal-transmission-sig': 'mock-transmission-sig',
    'paypal-transmission-time': 'mock-transmission-time',
    'paypal-auth-version': 'mock-auth-version',
  } as IPayPalWebhookHeaders;

  const mockCheckoutOrderApproved = {
    event_type: PayPalWebhookEvent.CheckoutOrderApproved,
    resource: {
      id: 'order-id',
      status: 'COMPLETED',
    } as IPayPalOrderResource,
  } as IPaypalWebhookBody;

  describe('Guards', () => {
    describe('PayPalWebhookGuard', () => {
      it('Should grant access when the webhook signature is valid', async () => {
        (
          paypalPaymentProviderMock.verifyWebhookSignature as jest.Mock
        ).mockResolvedValueOnce(true);

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(mockCheckoutOrderApproved)
          .expect(HttpStatus.OK);
      });

      it('Should throw an error when the webhook signature is invalid', async () => {
        (
          paypalPaymentProviderMock.verifyWebhookSignature as jest.Mock
        ).mockResolvedValueOnce(false);

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(mockCheckoutOrderApproved)
          .expect(HttpStatus.FORBIDDEN)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: INVALID_PAYPAL_WEBHOOK,
                source: {
                  pointer: expect.stringContaining(`${endpoint}/webhook`),
                },
                status: HttpStatus.FORBIDDEN.toString(),
                title: 'Forbidden',
              },
            });
            expect(body).toEqual(expectedResponse);
          });
      });
    });
  });

  describe('POST - /webhook', () => {
    describe('Webhook event CHECKOUT.ORDER.APPROVED', () => {
      const body = {
        event_type: PayPalWebhookEvent.CheckoutOrderApproved,
        resource: {
          id: 'order-id',
          status: 'COMPLETED',
        },
      } as IPaypalWebhookBody;

      it('Should return a successful webhook response dto', async () => {
        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(body)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: WEBHOOK_EVENT_NAME,
                attributes: expect.objectContaining({
                  message: 'Order with id capture-id approved',
                  processed: true,
                  purchaseStatus: PurchaseStatus.PENDING,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  method: HttpMethod.POST,
                  rel: 'self',
                  href: expect.stringContaining(`${endpoint}/webhook`),
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          });
      });
    });

    describe('Webhook event CHECKOUT.ORDER.DENIED', () => {
      const webhookEvent = {
        event_type: PayPalWebhookEvent.CheckoutOrderDeclined,
        resource: {
          id: '8U481631H66031715',
          status: 'FAILED',
        },
      } as IPaypalWebhookBody;

      it('Should return a successful webhook response dto updating the existing purchase', async () => {
        const purchase = await purchaseRepository.findByPaymentOrderIdOrFail(
          webhookEvent.resource.id,
        );
        expect(purchase.status).toBe(PurchaseStatus.PENDING);
        expect(purchase.paymentTransactionId).toBeNull();

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(webhookEvent)
          .expect(HttpStatus.OK)
          .then(async ({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: WEBHOOK_EVENT_NAME,
                attributes: expect.objectContaining({
                  message: `Order with id ${webhookEvent.resource.id} declined`,
                  processed: true,
                  purchaseStatus: PurchaseStatus.FAILED,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  method: HttpMethod.POST,
                  rel: 'self',
                  href: expect.stringContaining(`${endpoint}/webhook`),
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);

            const updatedPurchase =
              await purchaseRepository.findByPaymentOrderIdOrFail(
                webhookEvent.resource.id,
              );

            expect(updatedPurchase.status).toBe(PurchaseStatus.FAILED);
            expect(updatedPurchase.paymentTransactionId).toBeNull();
          });
      });

      it('Should throw an error if the purchase does not exist', async () => {
        const webhookEventWithNonExistingId = {
          ...webhookEvent,
          resource: {
            ...webhookEvent.resource,
            id: 'non-existing-id',
          },
        };
        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(webhookEventWithNonExistingId)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `Purchase with paymentOrderId ${webhookEventWithNonExistingId.resource.id} not found`,
                source: {
                  pointer: expect.stringContaining(`${endpoint}/webhook`),
                },
                status: HttpStatus.NOT_FOUND.toString(),
                title: 'Entity not found',
              },
            });
            expect(body).toEqual(expectedResponse);
          });
      });
    });

    describe('Webhook event PAYMENT.CAPTURE.COMPLETED', () => {
      const body = {
        event_type: PayPalWebhookEvent.PaymentCaptureCompleted,
        resource: {
          disbursement_mode: 'DELAYED',
          amount: {
            currency_code: 'USD',
            value: '57.00',
          },
          seller_protection: {
            status: 'ELIGIBLE',
            dispute_categories: [
              'ITEM_NOT_RECEIVED',
              'UNAUTHORIZED_TRANSACTION',
            ],
          },
          create_time: '2022-08-26T18:29:50Z',
          custom_id: 'd93e4fcb-d3af-137c-82fe-1a8101f1ad11',
          supplementary_data: {
            related_ids: {
              order_id: '8U481631H66031716',
            },
          },
          update_time: '2022-08-26T18:29:50Z',
          final_capture: true,
          invoice_id: '3942619:fdv09c49-a3g6-4cbf-1358-f6d241dacea2',
          id: '42311647XV020574X',
          status: 'COMPLETED',
        },
      } as IPaypalWebhookBody;
      const paymentOrderId = (body.resource as IPayPalCaptureResource)
        .supplementary_data?.related_ids?.order_id as string;
      const captureId = body.resource.id;

      it('Should return a successful webhook response dto updating the existing purchase', async () => {
        const purchase =
          await purchaseRepository.findByPaymentOrderIdOrFail(paymentOrderId);
        expect(purchase.status).toBe(PurchaseStatus.PENDING);
        expect(purchase.paymentTransactionId).toBeNull();

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(body)
          .expect(HttpStatus.OK)
          .then(async ({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: WEBHOOK_EVENT_NAME,
                attributes: expect.objectContaining({
                  message: `Order with id ${paymentOrderId} captured successfully with id ${captureId}`,
                  processed: true,
                  purchaseStatus: PurchaseStatus.COMPLETED,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  method: HttpMethod.POST,
                  rel: 'self',
                  href: expect.stringContaining(`${endpoint}/webhook`),
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);

            const updatedPurchase =
              await purchaseRepository.findByPaymentOrderIdOrFail(
                paymentOrderId,
              );

            expect(updatedPurchase.status).toBe(PurchaseStatus.COMPLETED);
            expect(updatedPurchase.paymentTransactionId).toBe(captureId);
          });
      });

      it('Should throw an error when the purchase does not exist', async () => {
        const nonExistingOrderId = 'non-existing-order-id';
        const bodyWithNonExistingOrderId = {
          ...body,
          resource: {
            ...body.resource,
            supplementary_data: {
              ...(body.resource as IPayPalCaptureResource).supplementary_data,
              related_ids: {
                order_id: nonExistingOrderId,
              },
            },
          },
        };

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(bodyWithNonExistingOrderId)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `Purchase with paymentOrderId ${nonExistingOrderId} not found`,
                source: {
                  pointer: expect.stringContaining(`${endpoint}/webhook`),
                },
                status: HttpStatus.NOT_FOUND.toString(),
                title: 'Entity not found',
              },
            });

            expect(body).toEqual(expectedResponse);
          });
      });
    });

    describe('Webhook event PAYMENT.CAPTURE.DENIED', () => {
      const body = {
        event_type: PayPalWebhookEvent.PaymentCaptureDenied,
        resource: {
          disbursement_mode: 'DELAYED',
          amount: {
            currency_code: 'USD',
            value: '57.00',
          },
          seller_protection: {
            status: 'NOT_ELIGIBLE',
            dispute_categories: [],
          },
          create_time: '2022-08-26T18:29:50Z',
          custom_id: 'd93e4fcb-d3af-137c-82fe-1a8101f1ad11',
          supplementary_data: {
            related_ids: {
              order_id: '8U481631H66031717',
            },
          },
          update_time: '2022-08-26T18:29:50Z',
          final_capture: false,
          invoice_id: '3942619:fdv09c49-a3g6-4cbf-1358-f6d241dacea2',
          id: '42311647XV020574X',
          status: 'DECLINED',
        },
      } as IPaypalWebhookBody;

      const paymentOrderId = (body.resource as IPayPalCaptureResource)
        .supplementary_data?.related_ids?.order_id as string;
      const captureId = body.resource.id;

      it('Should return a failed webhook response dto and update purchase status to FAILED', async () => {
        const purchase =
          await purchaseRepository.findByPaymentOrderIdOrFail(paymentOrderId);
        expect(purchase.status).not.toBe(PurchaseStatus.FAILED);
        expect(purchase.paymentTransactionId).toBeNull();

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(body)
          .expect(HttpStatus.OK)
          .then(async ({ body: responseBody }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: WEBHOOK_EVENT_NAME,
                attributes: expect.objectContaining({
                  message: `Order with id ${paymentOrderId} capture failed with id ${captureId}`,
                  processed: true,
                  purchaseStatus: PurchaseStatus.FAILED,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  method: HttpMethod.POST,
                  rel: 'self',
                  href: expect.stringContaining(`${endpoint}/webhook`),
                }),
              ]),
            });

            expect(responseBody).toEqual(expectedResponse);

            const updatedPurchase =
              await purchaseRepository.findByPaymentOrderIdOrFail(
                paymentOrderId,
              );

            expect(updatedPurchase.status).toBe(PurchaseStatus.FAILED);
            expect(updatedPurchase.paymentTransactionId).toBe(captureId);
          });
      });

      it('Should throw an error when the purchase does not exist for denied capture', async () => {
        const nonExistingOrderId = 'non-existing-order-id-denied';
        const bodyWithNonExistingOrderId = {
          ...body,
          resource: {
            ...body.resource,
            supplementary_data: {
              ...(body.resource as IPayPalCaptureResource).supplementary_data,
              related_ids: {
                order_id: nonExistingOrderId,
              },
            },
          },
        };

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(bodyWithNonExistingOrderId)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body: responseBody }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `Purchase with paymentOrderId ${nonExistingOrderId} not found`,
                source: {
                  pointer: expect.stringContaining(`${endpoint}/webhook`),
                },
                status: HttpStatus.NOT_FOUND.toString(),
                title: 'Entity not found',
              },
            });

            expect(responseBody).toEqual(expectedResponse);
          });
      });
    });

    describe('Webhook event PAYMENT.CAPTURE.CANCELLED', () => {
      const body = {
        event_type: PayPalWebhookEvent.PaymentCaptureCancelled,
        resource: {
          disbursement_mode: 'DELAYED',
          amount: {
            currency_code: 'USD',
            value: '57.00',
          },
          seller_protection: {
            status: 'ELIGIBLE',
            dispute_categories: [
              'ITEM_NOT_RECEIVED',
              'UNAUTHORIZED_TRANSACTION',
            ],
          },
          create_time: '2022-08-26T18:29:50Z',
          custom_id: 'd93e4fcb-d3af-137c-82fe-1a8101f1ad11',
          supplementary_data: {
            related_ids: {
              order_id: '8U481631H66031718',
            },
          },
          update_time: '2022-08-26T18:29:50Z',
          final_capture: false,
          invoice_id: '3942619:fdv09c49-a3g6-4cbf-1358-f6d241dacea2',
          id: '42311647XV020574X',
          status: 'CANCELLED',
        },
      } as IPaypalWebhookBody;

      const paymentOrderId = (body.resource as IPayPalCaptureResource)
        .supplementary_data?.related_ids?.order_id as string;
      const captureId = body.resource.id;

      it('Should return a cancelled webhook response dto and update purchase status to CANCELLED', async () => {
        const purchase =
          await purchaseRepository.findByPaymentOrderIdOrFail(paymentOrderId);
        expect(purchase.status).toBe(PurchaseStatus.PENDING);
        expect(purchase.paymentTransactionId).toBeNull();

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(body)
          .expect(HttpStatus.OK)
          .then(async ({ body: responseBody }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: WEBHOOK_EVENT_NAME,
                attributes: expect.objectContaining({
                  message: `Order with id ${paymentOrderId} cancelled with id ${captureId}`,
                  processed: true,
                  purchaseStatus: PurchaseStatus.CANCELLED,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  method: HttpMethod.POST,
                  rel: 'self',
                  href: expect.stringContaining(`${endpoint}/webhook`),
                }),
              ]),
            });

            expect(responseBody).toEqual(expectedResponse);

            const updatedPurchase =
              await purchaseRepository.findByPaymentOrderIdOrFail(
                paymentOrderId,
              );

            expect(updatedPurchase.status).toBe(PurchaseStatus.CANCELLED);
            expect(updatedPurchase.paymentTransactionId).toBe(captureId);
          });
      });

      it('Should throw an error when the purchase does not exist for cancelled capture', async () => {
        const nonExistingOrderId = 'non-existing-order-id-cancelled';
        const bodyWithNonExistingOrderId = {
          ...body,
          resource: {
            ...body.resource,
            supplementary_data: {
              ...(body.resource as IPayPalCaptureResource).supplementary_data,
              related_ids: {
                order_id: nonExistingOrderId,
              },
            },
          },
        };

        return await request(app.getHttpServer())
          .post(`${endpoint}/webhook`)
          .set(mockPaypalHeaders as unknown as IncomingHttpHeaders)
          .send(bodyWithNonExistingOrderId)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body: responseBody }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `Purchase with paymentOrderId ${nonExistingOrderId} not found`,
                source: {
                  pointer: expect.stringContaining(`${endpoint}/webhook`),
                },
                status: HttpStatus.NOT_FOUND.toString(),
                title: 'Entity not found',
              },
            });

            expect(responseBody).toEqual(expectedResponse);
          });
      });
    });
  });
});
