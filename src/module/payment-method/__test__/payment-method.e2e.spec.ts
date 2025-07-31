/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { loadFixtures } from '@data/util/fixture-loader';

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { CreatePaymentMethodDto } from '@module/payment-method/application/dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from '@module/payment-method/application/dto/payment-method-response.dto';
import { PaymentMethodDto } from '@module/payment-method/application/dto/payment-method.dto';
import { UpdatePaymentMethodDto } from '@module/payment-method/application/dto/update-payment-method.dto';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('PaymentMethod Module', () => {
  let app: NestExpressApplication;

  const regularToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Z',
  });
  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Y',
  });
  const superAdminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
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

  const endpoint = '/api/v1/payment-method';

  describe('GET - /payment-method', () => {
    it('Should return paginated payment methods', async () => {
      return await request(app.getHttpServer())
        .get(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                type: 'payment-method',
                attributes: expect.objectContaining({
                  name: expect.any(String),
                }),
              }),
            ]),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.any(String),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'first',
                href: expect.any(String),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'last',
                href: expect.any(String),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'next',
                href: expect.any(String),
                method: HttpMethod.GET,
              }),
            ]),
            meta: expect.objectContaining({
              pageNumber: expect.any(Number),
              pageSize: expect.any(Number),
              pageCount: expect.any(Number),
              itemCount: expect.any(Number),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should allow to filter by attributes', async () => {
      const name = 'Stellar';
      return request(app.getHttpServer())
        .get(`${endpoint}?filter[name]=${name}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  attributes: expect.objectContaining({
                    name,
                  }),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
            expect(body.data).toHaveLength(1);
          },
        );
    });

    it('Should allow to sort by attributes', async () => {
      const firstPaymentMethod = { name: '' } as PaymentMethodDto;
      const lastPaymentMethod = { name: '' } as PaymentMethodDto;
      let pageCount: number = 0;

      await request(app.getHttpServer())
        .get(`${endpoint}?sort[name]=DESC&page[size]=10`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<PaymentMethodResponseDto>;
          }) => {
            firstPaymentMethod.name = body.data[0].attributes.name;
            pageCount = (body.meta as IPagingCollectionData).pageCount;
          },
        );

      await request(app.getHttpServer())
        .get(
          `${endpoint}?page[size]=10&sort[name]=ASC&page[number]=${pageCount}`,
        )
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<PaymentMethodResponseDto>;
          }) => {
            const resources = body.data;
            lastPaymentMethod.name =
              resources[resources.length - 1].attributes.name;
            expect(lastPaymentMethod.name).toBe(firstPaymentMethod.name);
          },
        );
    });

    it('Should allow to select specific attributes', async () => {
      const attributes = ['name'] as (keyof PaymentMethodDto)[];

      await request(app.getHttpServer())
        .get(`${endpoint}?page[size]=10&fields[target]=${attributes.join(',')}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<PaymentMethodResponseDto>;
          }) => {
            const resourceAttributes = body.data[0].attributes;
            expect(Object.keys(resourceAttributes).length).toBe(
              attributes.length,
            );
            expect(resourceAttributes).toEqual({
              name: expect.any(String),
            });
          },
        );
    });
  });

  describe('GET - /payment-method/:id', () => {
    it('Should return a payment method by its id', async () => {
      const paymentMethodId = '361cb833-1f51-4b21-b5e9-1089c5d09b09';
      await request(app.getHttpServer())
        .get(`${endpoint}/${paymentMethodId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'payment-method',
              id: paymentMethodId,
              attributes: expect.objectContaining({
                name: 'Stellar',
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(`${endpoint}/${paymentMethodId}`),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'create-payment-method',
                href: expect.stringContaining(endpoint),
                method: HttpMethod.POST,
              }),
              expect.objectContaining({
                rel: 'update-payment-method',
                href: expect.stringContaining(`${endpoint}/${paymentMethodId}`),
                method: HttpMethod.PATCH,
              }),
              expect.objectContaining({
                rel: 'delete-payment-method',
                href: expect.stringContaining(`${endpoint}/${paymentMethodId}`),
                method: HttpMethod.DELETE,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if payment method is not found', async () => {
      const nonExistingPaymentMethodId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      await request(app.getHttpServer())
        .get(`${endpoint}/${nonExistingPaymentMethodId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingPaymentMethodId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingPaymentMethodId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('POST - /payment-method', () => {
    it('Should create a new payment method', async () => {
      const createPaymentMethod = {
        name: 'Mercado Pago',
      } as CreatePaymentMethodDto;
      let paymentMethodId = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.CREATED)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            paymentMethodId = body.data.id as string;
            const expectedResponse = {
              data: expect.objectContaining({
                type: 'payment-method',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createPaymentMethod.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'get-payment-method',
                  href: expect.stringContaining(
                    `${endpoint}/${paymentMethodId}`,
                  ),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'update-payment-method',
                  href: expect.stringContaining(
                    `${endpoint}/${paymentMethodId}`,
                  ),
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'delete-payment-method',
                  href: expect.stringContaining(
                    `${endpoint}/${paymentMethodId}`,
                  ),
                  method: HttpMethod.DELETE,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error when the payment method name already exists', async () => {
      const createPaymentMethod = {
        name: 'Debit Card',
      } as CreatePaymentMethodDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.CREATED)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = {
              data: expect.objectContaining({
                type: 'payment-method',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createPaymentMethod.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.CONFLICT)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `Entity with name '${createPaymentMethod.name}' already exists`,
                source: {
                  pointer: endpoint,
                },
                status: HttpStatus.CONFLICT.toString(),
                title: 'Entity already exists',
              },
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should deny access to non-super-admin users', async () => {
      const createPaymentMethod = {
        name: 'Mercado Pago',
      } as CreatePaymentMethodDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.FORBIDDEN)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `You are not allowed to ${AppAction.Create.toUpperCase()} this resource`,
                source: {
                  pointer: endpoint,
                },
                status: HttpStatus.FORBIDDEN.toString(),
                title: 'Forbidden',
              },
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.FORBIDDEN)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `You are not allowed to ${AppAction.Create.toUpperCase()} this resource`,
                source: {
                  pointer: endpoint,
                },
                status: HttpStatus.FORBIDDEN.toString(),
                title: 'Forbidden',
              },
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });
  });

  describe('PATCH - /payment-method/:id', () => {
    it('Should update an existing payment method', async () => {
      const createPaymentMethod = {
        name: 'Stripe',
      } as CreatePaymentMethodDto;

      const updatePaymentMethod = {
        name: 'credit-card',
      } as UpdatePaymentMethodDto;

      let paymentMethodId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.CREATED)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            paymentMethodId = body.data.id as string;

            const expectedResponse = {
              data: expect.objectContaining({
                type: 'payment-method',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createPaymentMethod.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${paymentMethodId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updatePaymentMethod)
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'payment-method',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: updatePaymentMethod.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'get-payment-method',
                  href: expect.stringContaining(
                    `${endpoint}/${paymentMethodId}`,
                  ),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'create-payment-method',
                  href: expect.stringContaining(endpoint),
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'delete-payment-method',
                  href: expect.stringContaining(
                    `${endpoint}/${paymentMethodId}`,
                  ),
                  method: HttpMethod.DELETE,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if payment method to update is not found', async () => {
      const nonExistingPaymentMethodId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';

      await request(app.getHttpServer())
        .patch(`${endpoint}/${nonExistingPaymentMethodId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingPaymentMethodId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingPaymentMethodId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non-super-admin users', async () => {
      const createPaymentMethod = {
        name: 'Payment method',
      } as CreatePaymentMethodDto;

      const updatePaymentMethod = {
        name: 'credit-card',
      } as UpdatePaymentMethodDto;

      let paymentMethodId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.CREATED)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            paymentMethodId = body.data.id as string;

            const expectedResponse = {
              data: expect.objectContaining({
                type: 'payment-method',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createPaymentMethod.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${paymentMethodId}`)
        .auth(regularToken, { type: 'bearer' })
        .send(updatePaymentMethod)
        .expect(HttpStatus.FORBIDDEN)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
                source: {
                  pointer: `${endpoint}/${paymentMethodId}`,
                },
                status: HttpStatus.FORBIDDEN.toString(),
                title: 'Forbidden',
              },
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      return await request(app.getHttpServer())
        .patch(`${endpoint}/${paymentMethodId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updatePaymentMethod)
        .expect(HttpStatus.FORBIDDEN)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
                source: {
                  pointer: `${endpoint}/${paymentMethodId}`,
                },
                status: HttpStatus.FORBIDDEN.toString(),
                title: 'Forbidden',
              },
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });
  });

  describe('DELETE - /payment-method/:id', () => {
    it('Should delete an existing payment method', async () => {
      const createPaymentMethod = {
        name: 'Stripe',
      } as CreatePaymentMethodDto;
      let paymentMethodId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.CREATED)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            paymentMethodId = body.data.id as string;

            const expectedResponse = {
              data: expect.objectContaining({
                type: 'payment-method',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createPaymentMethod.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${paymentMethodId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<SuccessOperationResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'operation',
                attributes: expect.objectContaining({
                  message: `The payment method with id ${paymentMethodId} has been deleted successfully`,
                  success: true,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.DELETE,
                }),
                expect.objectContaining({
                  rel: 'create-payment-method',
                  href: expect.stringContaining(endpoint),
                  method: HttpMethod.POST,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if payment method to delete is not found', async () => {
      const nonExistingPaymentMethodId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';

      await request(app.getHttpServer())
        .delete(`${endpoint}/${nonExistingPaymentMethodId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingPaymentMethodId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingPaymentMethodId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non-super-admin users', async () => {
      const createPaymentMethod = {
        name: 'Payment method 2',
      } as CreatePaymentMethodDto;

      let paymentMethodId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createPaymentMethod)
        .expect(HttpStatus.CREATED)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            paymentMethodId = body.data.id as string;

            const expectedResponse = {
              data: expect.objectContaining({
                type: 'payment-method',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createPaymentMethod.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${paymentMethodId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
                source: {
                  pointer: `${endpoint}/${paymentMethodId}`,
                },
                status: HttpStatus.FORBIDDEN.toString(),
                title: 'Forbidden',
              },
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      return await request(app.getHttpServer())
        .delete(`${endpoint}/${paymentMethodId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDto<PaymentMethodResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              error: {
                detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
                source: {
                  pointer: `${endpoint}/${paymentMethodId}`,
                },
                status: HttpStatus.FORBIDDEN.toString(),
                title: 'Forbidden',
              },
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });
  });
});
