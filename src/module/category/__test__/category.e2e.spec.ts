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
import { INonPaginatedSerializedCollection } from '@common/base/application/dto/serialized-response.interface';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { CategoryResponseDto } from '@module/category/application/dto/category-response.dto';
import { CategoryDto } from '@module/category/application/dto/category.dto';
import { CreateCategoryDto } from '@module/category/application/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/application/dto/update-category.dto';
import { AppAction } from '@module/iam/authorization/domain/app.action.enum';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

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

  describe('GET - /category', () => {
    it('Should return paginated categories', async () => {
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
                  id: expect.any(String),
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
          },
        );
    });

    it('Should allow to filter by attributes', async () => {
      const name = 'Category 1';

      return await request(app.getHttpServer())
        .get(`${endpoint}?filter[name]=${name}`)
        .auth(adminToken, { type: 'bearer' })
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
      const firstCategory = { name: '' } as CategoryDto;
      const lastCategory = { name: '' } as CategoryDto;
      let pageCount: number = 0;

      await request(app.getHttpServer())
        .get(`${endpoint}?sort[name]=DESC&page[size]=10`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CategoryResponseDto>;
          }) => {
            firstCategory.name = body.data[0].attributes.name;
            pageCount = (body.meta as IPagingCollectionData).pageCount;
          },
        );

      await request(app.getHttpServer())
        .get(
          `${endpoint}?page[size]=10&sort[name]=ASC&page[number]=${pageCount}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CategoryResponseDto>;
          }) => {
            const resources = body.data;
            lastCategory.name = resources[resources.length - 1].attributes.name;
            expect(lastCategory.name).toBe(firstCategory.name);
          },
        );
    });

    it('Should allow to select specific attributes', async () => {
      const attributes = ['name'] as (keyof CategoryDto)[];

      await request(app.getHttpServer())
        .get(`${endpoint}?page[size]=10&fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CategoryResponseDto>;
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

  describe('GET - /category/roots', () => {
    it('Should return a list of root categories', async () => {
      const nonRootCategoryIds = [
        '5fb9c427-2551-4787-81c4-b6c603175f45',
        '143ce6ee-b7c0-4d25-9463-76d0f7a14663',
      ];

      return await request(app.getHttpServer())
        .get(`${endpoint}/roots`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: INonPaginatedSerializedCollection<CategoryResponseDto>;
          }) => {
            const { data } = body;
            nonRootCategoryIds.forEach((id) => {
              expect(data).not.toContainEqual(
                expect.objectContaining({
                  id,
                }),
              );
            });

            const expectedResponse = expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  type: 'category',
                  id: expect.any(String),
                  attributes: expect.objectContaining({
                    name: expect.any(String),
                  }),
                  links: expect.arrayContaining([
                    expect.objectContaining({
                      rel: 'get-category-children',
                      href: expect.stringMatching(/category\/.*\/children/),
                      method: HttpMethod.GET,
                    }),
                  ]),
                }),
              ]),
              links: expect.arrayContaining([
                expect.objectContaining({
                  rel: 'self',
                  href: expect.stringContaining(`${endpoint}/roots`),
                  method: HttpMethod.GET,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });
  });

  describe('GET - /category/:id', () => {
    it('Should return a category by its id', async () => {
      const categoryId = '2d915994-8c06-425c-9a64-23a7b2b8603e';

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
                name: 'Category 1',
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

    it('Should include a path to the ancestors', async () => {
      const categoryId = '143ce6ee-b7c0-4d25-9463-76d0f7a14663';

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
                name: 'Category 3',
                parent: expect.objectContaining({
                  id: '5fb9c427-2551-4787-81c4-b6c603175f45',
                  name: 'Category 2',
                  parent: expect.objectContaining({
                    id: '2d915994-8c06-425c-9a64-23a7b2b8603e',
                    name: 'Category 1',
                  }),
                }),
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

  describe('GET - /category/:id/children', () => {
    it('Should return a category with its children by id', async () => {
      const categoryId = '2d915994-8c06-425c-9a64-23a7b2b8603e';

      await request(app.getHttpServer())
        .get(`${endpoint}/${categoryId}/children`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'category',
              id: categoryId,
              attributes: expect.objectContaining({
                name: 'Category 1',
                children: expect.arrayContaining([
                  expect.objectContaining({
                    id: expect.any(String),
                    name: 'Category 2',
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
        name: 'Programming',
      } as CreateCategoryDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            const { id } = body.data;
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
                expect.objectContaining({
                  rel: 'get-category',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'update-category',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'delete-category',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.DELETE,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error when the root category already exists', async () => {
      const createNonDuplicatedCategoryDto = {
        name: 'Design',
      } as CreateCategoryDto;
      const createDuplicatedCategoryDto = {
        name: createNonDuplicatedCategoryDto.name,
      } as CreateCategoryDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createNonDuplicatedCategoryDto)
        .expect(HttpStatus.CREATED);

      return await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createDuplicatedCategoryDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Root category '${createDuplicatedCategoryDto.name}' already exists`,
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
      const createParentCategoryDto = {
        name: 'Mathematics',
      } as CreateCategoryDto;
      const createSubCategoryDto = {
        name: 'Algebra',
      } as CreateCategoryDto;

      let parentId = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createParentCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            parentId = body.data.id as string;
          },
        );

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send({
          ...createSubCategoryDto,
          parentId,
        })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send({
          ...createSubCategoryDto,
          parentId,
        })
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Subcategory '${createSubCategoryDto.name}' already exists under '${createParentCategoryDto.name}' category`,
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
      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      const createCategoryDto = {
        name: 'Fishing',
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
      const createCategoryDto = {
        name: 'Ssports',
      } as CreateCategoryDto;
      const updateCategoryDto = {
        name: 'Sports',
      } as UpdateCategoryDto;

      let categoryId = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            categoryId = body.data.id as string;
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

    it('Should throw an error when the root category already exists under the new name', async () => {
      const createFirstRootCategoryDto = {
        name: 'History',
      } as CreateCategoryDto;
      const createSecondRootCategoryDto = {
        name: 'Geography',
      } as CreateCategoryDto;
      const updateCategoryDto = {
        name: createFirstRootCategoryDto.name,
      } as UpdateCategoryDto;

      let categoryId = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createFirstRootCategoryDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createSecondRootCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            categoryId = body.data.id as string;
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${categoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Root category '${updateCategoryDto.name}' already exists`,
              source: {
                pointer: `${endpoint}/${categoryId}`,
              },
              status: HttpStatus.CONFLICT.toString(),
              title: 'Category already exists',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error when the subcategory already exists', async () => {
      const createRootCategoryDto = {
        name: 'Literature',
      } as CreateCategoryDto;
      const createSubCategoryCategoryDto = {
        name: 'Novel',
      } as CreateCategoryDto;
      const createSecondSubCategoryCategoryDto = {
        name: 'Classic',
      } as CreateCategoryDto;
      const updateCategoryDto = {
        name: createSubCategoryCategoryDto.name,
      } as UpdateCategoryDto;
      let parentId = '';
      let categoryId = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createRootCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            parentId = body.data.id as string;
          },
        );

      createSubCategoryCategoryDto.parentId = parentId;
      createSecondSubCategoryCategoryDto.parentId = parentId;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createSubCategoryCategoryDto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createSecondSubCategoryCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            categoryId = body.data.id as string;
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${categoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.CONFLICT)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Subcategory '${updateCategoryDto.name}' already exists under '${createRootCategoryDto.name}' category`,
              source: {
                pointer: `${endpoint}/${categoryId}`,
              },
              status: HttpStatus.CONFLICT.toString(),
              title: 'Category already exists',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error when the parent category does not exist', async () => {
      const createRootCategoryDto = {
        name: 'Literaturee',
      } as CreateCategoryDto;
      const nonExistingCategoryId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      const updateCategoryDto = {
        name: 'Literature',
        parentId: nonExistingCategoryId,
      } as UpdateCategoryDto;
      let categoryId = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createRootCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            categoryId = body.data.id as string;
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${categoryId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateCategoryDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCategoryId} not found`,
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

    it('Should deny access to non-super-admin users', async () => {
      const updateCategoryDto = {
        name: 'Edited',
      } as UpdateCategoryDto;

      const categoryId = '2d915994-8c06-425c-9a64-23a7b2b8603e';

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
      const createCategoryDto = {
        name: 'Blockchain',
      } as CreateCategoryDto;
      let categoryId = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CategoryResponseDto> }) => {
            categoryId = body.data.id as string;
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

      return await request(app.getHttpServer())
        .get(`${endpoint}/${categoryId}`)
        .auth(regularToken, { type: 'bearer' })
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

    it('Should deny access to non-super-admin users', async () => {
      const categoryId = '143ce6ee-b7c0-4d25-9463-76d0f7a14663';

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
