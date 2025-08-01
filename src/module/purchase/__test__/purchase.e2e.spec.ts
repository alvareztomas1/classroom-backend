/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { loadFixtures } from '@data/util/fixture-loader';

import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { IS_NOT_VALID_MESSAGE } from '@common/base/application/exception/base-exception.messages';

import { AppAction } from '@iam/authorization/domain/app.action.enum';

import { CreatePurchaseDtoRequest } from '@purchase/application/dto/create-purchase.dto';
import { UpdatePurchaseDto } from '@purchase/application/dto/update-purchase.dto';
import {
  CAN_NOT_BUY_OWN_COURSE_MESSAGE,
  COURSE_NOT_PUBLISHED_MESSAGE,
  COURSE_WITH_ID_MESSAGE,
  PURCHASE_ALREADY_EXISTS_MESSAGE,
  PURCHASE_FOR_COURSE_MESSAGE,
  STATUS_TRANSITION_MESSAGE,
} from '@purchase/application/exception/purchase-exception.messages';
import { Purchase } from '@purchase/domain/purchase.entity';
import { PurchaseStatus } from '@purchase/domain/purchase.status.enum';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Purchase Module', () => {
  let app: NestExpressApplication;

  const superAdminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });
  const regularToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Z',
  });
  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Y',
  });

  beforeAll(async () => {
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication({ logger: false });
    setupApp(app);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const endpoint = '/api/v1/purchase';
  const existingCourses = {
    first: {
      id: '29694b5e-c5d1-487e-a6e8-3f7aa6c4238c',
      amount: 49.99,
    },
    second: {
      id: '89dd5d47-9c71-463b-b021-0bc3289f998d',
      amount: 89.99,
    },
    third: {
      id: '57732eea-ce64-4e9b-80c6-63a08ee82764',
      amount: 79.99,
    },
  };
  const existingUsers = {
    regular: {
      id: '5e822193-13ca-4846-9b60-9f2f38d7eefa',
    },
  };
  const existingPaymentMethodId = '361cb833-1f51-4b21-b5e9-1089c5d09b09';

  describe('GET - /purchase/:id', () => {
    it('Should return a purchase', async () => {
      const existingPurchaseId = 'a5978602-defc-4415-ae50-33ce6902e113';

      return await request(app.getHttpServer())
        .get(`${endpoint}/${existingPurchaseId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: existingPurchaseId,
              type: Purchase.getEntityName(),
              attributes: expect.objectContaining({
                status: PurchaseStatus.COMPLETED,
                amount: expect.any(Number),
                userId: expect.any(String),
                courseId: expect.any(String),
                paymentTransactionId: expect.any(String),
                refundTransactionId: null,
                paymentMethodId: existingPaymentMethodId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(
                  `${endpoint}/${existingPurchaseId}`,
                ),
                method: HttpMethod.GET,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the purchase does not exist', async () => {
      const nonExistingPurchaseId = '3287e48b-89d7-458c-9ad9-ce88b487fa53';

      return await request(app.getHttpServer())
        .get(`${endpoint}/${nonExistingPurchaseId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingPurchaseId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingPurchaseId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to a user who is not the owner of the purchase', async () => {
      const existingPurchaseId = 'e6c78b10-d9b0-4819-ac4e-a36ca36f8554';

      return await request(app.getHttpServer())
        .get(`${endpoint}/${existingPurchaseId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Read.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingPurchaseId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('POST - /purchase', () => {
    it('Should create a purchase', async () => {
      const createPurchaseDto = {
        courseId: existingCourses.first.id,
        paymentMethodId: existingPaymentMethodId,
      } as CreatePurchaseDtoRequest;

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .send(createPurchaseDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = {
            data: expect.objectContaining({
              id: expect.any(String),
              type: Purchase.getEntityName(),
              attributes: expect.objectContaining({
                status: PurchaseStatus.PENDING,
                amount: existingCourses.first.amount,
                userId: existingUsers.regular.id,
                courseId: existingCourses.first.id,
                paymentMethodId: existingPaymentMethodId,
                paymentTransactionId: null,
                refundTransactionId: null,
                createdAt: expect.any(String),
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(`${endpoint}`),
                method: HttpMethod.POST,
              }),
            ]),
          };

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny purchases for not published courses', async () => {
      const courseId = existingCourses.second.id;
      const createPurchaseDto = {
        courseId,
        paymentMethodId: existingPaymentMethodId,
      } as CreatePurchaseDtoRequest;

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .send(createPurchaseDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `${COURSE_WITH_ID_MESSAGE} ${courseId} ${COURSE_NOT_PUBLISHED_MESSAGE}`,
              source: {
                pointer: endpoint,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Course not published',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny purchases to not existing courses', async () => {
      const nonExistingCourseId = 'bf16df65-145f-4a1c-a566-17ac56229a57';

      const createPurchaseDto = {
        courseId: nonExistingCourseId,
        paymentMethodId: existingPaymentMethodId,
      } as CreatePurchaseDtoRequest;

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .send(createPurchaseDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCourseId} not found`,
              source: {
                pointer: endpoint,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny purchases when user is instructor', async () => {
      const courseId = existingCourses.first.id;
      const createPurchaseDto = {
        courseId,
        paymentMethodId: existingPaymentMethodId,
      } as CreatePurchaseDtoRequest;

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .send(createPurchaseDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: CAN_NOT_BUY_OWN_COURSE_MESSAGE,
              source: {
                pointer: endpoint,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Self purchase not allowed',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny duplicate purchases', async () => {
      const courseId = existingCourses.third.id;

      const createPurchaseDto = {
        courseId,
        paymentMethodId: existingPaymentMethodId,
      } as CreatePurchaseDtoRequest;

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .send(createPurchaseDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `${PURCHASE_FOR_COURSE_MESSAGE} ${courseId} ${PURCHASE_ALREADY_EXISTS_MESSAGE} ${PurchaseStatus.COMPLETED}`,
              source: {
                pointer: endpoint,
              },
              status: HttpStatus.CONFLICT.toString(),
              title: 'Purchase already exists',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /purchase/:id/status', () => {
    it('Should update a purchase', async () => {
      const existingPurchaseId = 'e6c78b10-d9b0-4819-ac4e-a36ca36f8554';
      const paymentTransactionId = '00000000-0000-0000-0000-000000000000';
      const updatePurchaseDto = {
        status: PurchaseStatus.COMPLETED,
        paymentTransactionId,
      } as UpdatePurchaseDto;

      return await request(app.getHttpServer())
        .patch(`${endpoint}/${existingPurchaseId}/status`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updatePurchaseDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: existingPurchaseId,
              type: Purchase.getEntityName(),
              attributes: expect.objectContaining({
                status: PurchaseStatus.COMPLETED,
                amount: expect.any(Number),
                userId: expect.any(String),
                courseId: expect.any(String),
                updatedAt: expect.any(String),
                paymentTransactionId,
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(
                  `${endpoint}/${existingPurchaseId}`,
                ),
                method: HttpMethod.PATCH,
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the purchase does not exist', async () => {
      const nonExistingPurchaseId = 'a731f47d-cd6c-4cdb-ac60-c9e9fc52f589';
      const updatePurchaseDto = {
        status: PurchaseStatus.COMPLETED,
        paymentTransactionId: '00000000-0000-0000-0000-000000000000',
      } as UpdatePurchaseDto;

      return await request(app.getHttpServer())
        .patch(`${endpoint}/${nonExistingPurchaseId}/status`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updatePurchaseDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingPurchaseId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingPurchaseId}/status`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error with invalid status transition', async () => {
      const purchaseId = 'a5978602-defc-4415-ae50-33ce6902e113';
      const updatePurchaseDto = {
        status: PurchaseStatus.PENDING,
        paymentTransactionId: '00000000-0000-0000-0000-000000000000',
      } as UpdatePurchaseDto;

      return await request(app.getHttpServer())
        .patch(`${endpoint}/${purchaseId}/status`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updatePurchaseDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `${STATUS_TRANSITION_MESSAGE} ${PurchaseStatus.COMPLETED} to ${updatePurchaseDto.status} ${IS_NOT_VALID_MESSAGE}`,
              source: {
                pointer: `${endpoint}/${purchaseId}/status`,
              },
              status: HttpStatus.BAD_REQUEST.toString(),
              title: 'Invalid purchase',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non-super-admin users', async () => {
      const existingPurchaseId = 'e6c78b10-d9b0-4819-ac4e-a36ca36f8554';
      const updatePurchaseDto = {
        status: PurchaseStatus.COMPLETED,
        paymentTransactionId: '00000000-0000-0000-0000-000000000000',
      } as UpdatePurchaseDto;

      return await request(app.getHttpServer())
        .patch(`${endpoint}/${existingPurchaseId}/status`)
        .auth(adminToken, { type: 'bearer' })
        .send(updatePurchaseDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Manage.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingPurchaseId}/status`,
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
