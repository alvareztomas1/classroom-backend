/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import {
  mockTypeOrmRepository,
  testModuleBootstrapper,
} from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { Category } from '@module/category/domain/category.entity';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';

describe('Category Module', () => {
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

  const endpoint = '/api/v1/category';

  const mockParent = new Category(
    'Data Structures',
    'e7a70fc2-5277-492f-bd24-a14ce394a5b8',
  );
  const mockFirstSubCategory = new Category(
    'Algorithms',
    'feba550d-3713-4f6a-a045-07d0508dc25e',
    mockParent,
    [],
  );
  const mockSecondSubCategory = new Category(
    'Sorting',
    'bd1cf912-6545-4636-8fea-087654f10232',
    mockFirstSubCategory,
  );

  mockFirstSubCategory.subCategories?.push(mockSecondSubCategory);

  const mockCategories = [
    mockParent,
    mockFirstSubCategory,
    mockSecondSubCategory,
  ];

  describe('GET - /category', () => {
    it('Should return paginated categories', async () => {
      mockTypeOrmRepository.findAndCount.mockImplementationOnce(() => [
        mockCategories,
        mockCategories.length,
      ]);

      return await request(app.getHttpServer())
        .get(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CategoryResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  type: 'category',
                  id: mockParent.id,
                  attributes: expect.objectContaining({
                    name: mockParent.name,
                  }),
                }),
                expect.objectContaining({
                  type: 'category',
                  id: mockFirstSubCategory.id,
                  attributes: expect.objectContaining({
                    name: mockFirstSubCategory.name,
                    parent: expect.objectContaining({
                      id: mockParent.id,
                      name: mockParent.name,
                    }),
                    subCategories: expect.arrayContaining([
                      expect.objectContaining({
                        id: mockSecondSubCategory.id,
                        name: mockSecondSubCategory.name,
                      }),
                    ]),
                  }),
                }),
                expect.objectContaining({
                  type: 'category',
                  id: mockSecondSubCategory.id,
                  attributes: expect.objectContaining({
                    name: mockSecondSubCategory.name,
                    parent: expect.objectContaining({
                      id: mockFirstSubCategory.id,
                      name: mockFirstSubCategory.name,
                    }),
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
              ]),
              meta: expect.objectContaining({
                pageNumber: expect.any(Number),
                pageSize: expect.any(Number),
                pageCount: expect.any(Number),
                itemCount: expect.any(Number),
              }),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });
  });

  describe('GET - /category/:id', () => {
    it('Should return a category by its id', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => mockParent);
      const categoryId = mockParent.id;

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
                name: mockParent.name,
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(`${endpoint}/${categoryId}`),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'create-category',
                href: expect.stringContaining(endpoint),
                method: HttpMethod.POST,
              }),
              expect.objectContaining({
                rel: 'update-category',
                href: expect.stringContaining(`${endpoint}/${categoryId}`),
                method: HttpMethod.PATCH,
              }),
              expect.objectContaining({
                rel: 'delete-category',
                href: expect.stringContaining(`${endpoint}/${categoryId}`),
                method: HttpMethod.DELETE,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if category is not found', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => null);
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

    it('Should include related categories', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(
        () => mockFirstSubCategory,
      );
      const categoryId = mockFirstSubCategory.id;

      await request(app.getHttpServer())
        .get(`${endpoint}/${categoryId}?include=parent,subCategories`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'category',
              id: categoryId,
              attributes: expect.objectContaining({
                name: mockFirstSubCategory.name,
                parent: expect.objectContaining({
                  id: mockParent.id,
                  name: mockParent.name,
                }),
                subCategories: expect.arrayContaining([
                  expect.objectContaining({
                    id: mockSecondSubCategory.id,
                    name: mockSecondSubCategory.name,
                  }),
                ]),
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
  });

  describe('POST - /category', () => {
    it('Should create a new category', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => null);
      mockTypeOrmRepository.save.mockImplementationOnce(() => mockParent);
      const createCategoryDto = {
        name: mockParent.name,
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
              id: mockParent.id,
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
              expect.objectContaining({
                rel: 'get-category',
                href: expect.stringContaining(`${endpoint}/${mockParent.id}`),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'update-category',
                href: expect.stringContaining(`${endpoint}/${mockParent.id}`),
                method: HttpMethod.PATCH,
              }),
              expect.objectContaining({
                rel: 'delete-category',
                href: expect.stringContaining(`${endpoint}/${mockParent.id}`),
                method: HttpMethod.DELETE,
              }),
            ]),
          };
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error when the root category already exists', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => mockParent);
      const createCategoryDto = {
        name: mockParent.name,
      } as CreateCategoryDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Root category '${createCategoryDto.name}' already exists`,
              source: {
                pointer: endpoint,
              },
              status: HttpStatus.CONFLICT.toString(),
              title: 'Category already exists',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error when the subcategory already exists', async () => {
      mockTypeOrmRepository.findOne
        .mockImplementationOnce(() => mockParent)
        .mockImplementationOnce(() => mockFirstSubCategory);
      const createCategoryDto = {
        name: mockFirstSubCategory.name,
        parentId: mockParent.id,
      } as CreateCategoryDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Subcategory '${createCategoryDto.name}' already exists under '${mockParent.name}' category`,
              source: {
                pointer: endpoint,
              },
              status: HttpStatus.CONFLICT.toString(),
              title: 'Category already exists',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error when the parent category does not exist', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => null);

      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      const createCategoryDto = {
        name: mockFirstSubCategory.name,
        parentId: nonExistingCategoryId,
      } as CreateCategoryDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCategoryId} not found`,
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

    it('Should deny access to non-super-admin users', async () => {
      const createCategoryDto = {
        name: 'Mathematics',
      } as CreateCategoryDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
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
        });

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
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
        });
    });
  });

  describe('PATCH - /category/:id', () => {
    it('Should update an existing category', async () => {
      const updateCategoryDto = {
        name: 'Edited',
      } as UpdateCategoryDto;

      mockTypeOrmRepository.findOne.mockImplementationOnce(
        () => mockFirstSubCategory,
      );

      mockTypeOrmRepository.save.mockImplementationOnce(() => ({
        ...mockFirstSubCategory,
        name: updateCategoryDto.name,
      }));

      const categoryId = mockFirstSubCategory.id;

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
                expect.objectContaining({
                  rel: 'get-category',
                  href: expect.stringContaining(`${endpoint}/${categoryId}`),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'create-category',
                  href: expect.stringContaining(`${endpoint}/${categoryId}`),
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'delete-category',
                  href: expect.stringContaining(`${endpoint}/${categoryId}`),
                  method: HttpMethod.DELETE,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if category to update is not found', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => null);

      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      const updateCategoryDto = {
        name: 'Edited',
      } as UpdateCategoryDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${nonExistingCategoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
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

    it('Should throw an error when the root category already exists', async () => {
      mockTypeOrmRepository.findOne
        .mockImplementationOnce(() => mockFirstSubCategory)
        .mockImplementationOnce(() => mockParent);
      const updateCategoryDto = {
        name: 'Edited',
      } as UpdateCategoryDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${mockFirstSubCategory.id}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Root category '${updateCategoryDto.name}' already exists`,
              source: {
                pointer: `${endpoint}/${mockFirstSubCategory.id}`,
              },
              status: HttpStatus.CONFLICT.toString(),
              title: 'Category already exists',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error when the subcategory already exists', async () => {
      mockTypeOrmRepository.findOne
        .mockImplementationOnce(() => mockParent)
        .mockImplementationOnce(() => mockFirstSubCategory);

      const updateCategoryDto = {
        name: 'Edited',
      } as UpdateCategoryDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${mockFirstSubCategory.id}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Subcategory '${updateCategoryDto.name}' already exists under '${mockParent.name}' category`,
              source: {
                pointer: `${endpoint}/${mockFirstSubCategory.id}`,
              },
              status: HttpStatus.CONFLICT.toString(),
              title: 'Category already exists',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error when the parent category does not exist', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => null);

      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      const updateCategoryDto = {
        name: 'Edited',
        parentId: nonExistingCategoryId,
      } as UpdateCategoryDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${mockFirstSubCategory.id}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCategoryId} not found`,
              source: {
                pointer: `${endpoint}/${mockFirstSubCategory.id}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non-super-admin users', async () => {
      const updateCategoryDto = {
        name: '',
        parentId: mockParent.id,
      } as UpdateCategoryDto;

      const categoryId = mockFirstSubCategory.id;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${categoryId}`)
        .auth(regularToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${categoryId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });

      return await request(app.getHttpServer())
        .patch(`${endpoint}/${categoryId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${categoryId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('DELETE - /category/:id', () => {
    it('Should delete an existing category', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(
        () => mockFirstSubCategory,
      );
      mockTypeOrmRepository.softRemove.mockImplementationOnce(() => true);

      const categoryId = mockFirstSubCategory.id;

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
                expect.objectContaining({
                  rel: 'create-category',
                  href: expect.stringContaining(endpoint),
                  method: HttpMethod.POST,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if category to delete is not found', async () => {
      mockTypeOrmRepository.findOne.mockImplementationOnce(() => null);
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

    it('Should deny access to non-super-admin users', async () => {
      const categoryId = mockFirstSubCategory.id;

      await request(app.getHttpServer())
        .delete(`${endpoint}/${categoryId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${categoryId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });

      return await request(app.getHttpServer())
        .delete(`${endpoint}/${categoryId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${categoryId}`,
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
