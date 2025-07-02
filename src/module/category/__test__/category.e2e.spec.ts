/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { SerializedResponseDto } from '@common/base/application/dto/serialized-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';

describe('Category Module', () => {
  let app: NestExpressApplication;

  const regularToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Z',
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

  const endpoint = '/api/v1/category';

  describe('GET - /category/:id', () => {
    it('Should return a category by its id', async () => {
      const categoryId = '5fb9c427-2551-4787-81c4-b6c603175f45';
      await request(app.getHttpServer())
        .get(`${endpoint}/${categoryId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'category',
              id: categoryId,
              attributes: expect.objectContaining({
                name: 'JavaScript',
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(`${endpoint}/${categoryId}`),
                method: HttpMethod.GET,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if category is not found', async () => {
      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      await request(app.getHttpServer())
        .get(`${endpoint}/${nonExistingCategoryId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCategoryId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingCategoryId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('POST - /category', () => {
    it('Should create a new category', async () => {
      const createCategoryDto = {
        name: 'Design',
      } as CreateCategoryDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = {
            data: expect.objectContaining({
              type: 'category',
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createCategoryDto.name,
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
        });
    });
  });

  describe('PATCH - /category/:id', () => {
    it('Should update an existing category', async () => {
      const createCategoryDto = {
        name: 'Mathematicss',
      } as CreateCategoryDto;

      const updateCategoryDto = {
        name: 'Mathematics',
      } as UpdateCategoryDto;

      let categoryId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            categoryId = body.data.id as string;

            const expectedResponse = {
              data: expect.objectContaining({
                type: 'category',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createCategoryDto.name,
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
        .patch(`${endpoint}/${categoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            const expectedResponse = {
              data: expect.objectContaining({
                type: 'category',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: updateCategoryDto.name,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(`${endpoint}/${categoryId}`),
                  rel: 'self',
                  method: HttpMethod.PATCH,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if category to update is not found', async () => {
      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';

      await request(app.getHttpServer())
        .patch(`${endpoint}/${nonExistingCategoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCategoryId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingCategoryId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('DELETE - /category/:id', () => {
    it('Should delete an existing category', async () => {
      const createCategoryDto = {
        name: 'Mathematicss',
      } as CreateCategoryDto;

      let categoryId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            categoryId = body.data.id as string;

            const expectedResponse = {
              data: expect.objectContaining({
                type: 'category',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  name: createCategoryDto.name,
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
        .delete(`${endpoint}/${categoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            const expectedResponse = {
              data: expect.objectContaining({
                type: 'operation',
                attributes: expect.objectContaining({
                  message: `The category with id ${categoryId} has been deleted successfully`,
                  success: true,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(`${endpoint}/${categoryId}`),
                  rel: 'self',
                  method: HttpMethod.DELETE,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .get(`${endpoint}/${categoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${categoryId} not found`,
              source: {
                pointer: `${endpoint}/${categoryId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if category to delete is not found', async () => {
      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';

      await request(app.getHttpServer())
        .delete(`${endpoint}/${nonExistingCategoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCategoryId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingCategoryId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });
});
