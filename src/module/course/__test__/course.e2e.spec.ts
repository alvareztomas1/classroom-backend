/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { MAX_FILE_SIZES } from '@common/base/application/constant/file.constant';
import {
  SerializedResponseDto,
  SerializedResponseDtoCollection,
} from '@common/base/application/dto/serialized-response.dto';
import { SuccessOperationResponseDto } from '@common/base/application/dto/success-operation-response.dto';
import { Difficulty } from '@common/base/application/enum/difficulty.enum';
import { ImageFormat } from '@common/base/application/enum/file-format.enum';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { PublishStatus } from '@common/base/application/enum/publish-status.enum';
import { MBTransformer } from '@common/transformers/mb.transformer';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken, createLargeMockFile } from '@test/test.util';

import { CourseResponseDto } from '@module/course/application/dto/course-response.dto';
import { CourseDto } from '@module/course/application/dto/course.dto';
import { CreateCourseDto } from '@module/course/application/dto/create-course.dto';
import { UpdateCourseDto } from '@module/course/application/dto/update-course.dto';
import { Course } from '@module/course/domain/course.entity';

describe('Course Module', () => {
  let app: NestExpressApplication;

  const imageMock = path.resolve(
    __dirname,
    '../../../test/__mocks__/avatar.jpg',
  );

  const txtMock = path.resolve(__dirname, '../../../test/__mocks__/txt.txt');

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Y',
  });

  const secondAdminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000W',
  });

  const regularToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Z',
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

  const endpoint = '/api/v1/course';

  describe('GET - /course', () => {
    it('Should return paginated courses', async () => {
      return await request(app.getHttpServer())
        .get(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(String),
                type: 'course',
                attributes: expect.objectContaining({
                  instructorId: expect.any(String),
                  title: expect.any(String),
                  description: expect.any(String),
                  price: expect.any(Number),
                  imageUrl: expect.any(String),
                  status: expect.any(String),
                  slug: expect.any(String),
                  difficulty: expect.any(String),
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
      const firstName = 'Introduction to Programming';
      return request(app.getHttpServer())
        .get(`${endpoint}?filter[title]=${firstName}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CourseResponseDto>;
          }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.arrayContaining([
                expect.objectContaining({
                  attributes: expect.objectContaining({
                    title: firstName,
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
      const firstCourse = { title: '' } as CourseDto;
      const lastCourse = { title: '' } as CourseDto;
      let pageCount: number = 0;

      await request(app.getHttpServer())
        .get(`${endpoint}?sort[title]=DESC&page[size]=10`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CourseResponseDto>;
          }) => {
            firstCourse.title = body.data[0].attributes.title;
            pageCount = body.meta.pageCount;
          },
        );

      await request(app.getHttpServer())
        .get(
          `${endpoint}?page[size]=10&sort[title]=ASC&page[number]=${pageCount}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CourseResponseDto>;
          }) => {
            const resources = body.data;
            lastCourse.title = resources[resources.length - 1].attributes.title;
            expect(lastCourse.title).toBe(firstCourse.title);
          },
        );
    });

    it('Should allow to select specific attributes', async () => {
      const attributes = ['title', 'description'] as (keyof CourseDto)[];

      await request(app.getHttpServer())
        .get(`${endpoint}?page[size]=10&fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<CourseResponseDto>;
          }) => {
            const resourceAttributes = body.data[0].attributes;
            expect(Object.keys(resourceAttributes).length).toBe(
              attributes.length,
            );
            expect(resourceAttributes).toEqual({
              title: expect.any(String),
              description: expect.any(String),
            });
          },
        );
    });

    it('Should allow to include related resources', async () => {
      await request(app.getHttpServer())
        .get(`${endpoint}?include[target]=instructor`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  instructor: expect.objectContaining({
                    firstName: 'admin-name',
                    lastName: 'admin-surname',
                    avatarUrl: expect.any(String),
                  }),
                }),
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('GET - /course/:id', () => {
    it('Should return a course by its id', async () => {
      const courseId = '22f38dae-00f1-49ff-8f3f-0dd6539af032';
      await request(app.getHttpServer())
        .get(`${endpoint}/${courseId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'course',
              id: courseId,
              attributes: expect.objectContaining({
                instructorId: expect.any(String),
                title: 'Introduction to Programming',
                description: 'Learn the basics of programming with JavaScript',
                price: 49.99,
                imageUrl: expect.stringContaining('intro-programming.jpg'),
                status: 'published',
                slug: 'introduction-to-programming',
                difficulty: Difficulty.BEGINNER,
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(`${endpoint}/${courseId}`),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'get-all',
                href: expect.stringContaining(endpoint),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'create',
                href: expect.stringContaining(endpoint),
                method: HttpMethod.POST,
              }),
              expect.objectContaining({
                rel: 'update',
                href: expect.stringContaining(`${endpoint}/${courseId}`),
                method: HttpMethod.PATCH,
              }),
              expect.objectContaining({
                rel: 'delete',
                href: expect.stringContaining(`${endpoint}/${courseId}`),
                method: HttpMethod.DELETE,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if course is not found', async () => {
      const nonExistingCourseId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      await request(app.getHttpServer())
        .get(`${endpoint}/${nonExistingCourseId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCourseId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingCourseId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should allow to include related resources', async () => {
      const courseId = '22f38dae-00f1-49ff-8f3f-0dd6539af032';
      await request(app.getHttpServer())
        .get(`${endpoint}/${courseId}?include[target]=instructor`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                instructor: expect.objectContaining({
                  firstName: 'admin-name',
                  lastName: 'admin-surname',
                  avatarUrl: expect.any(String),
                }),
              }),
            }),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should filter links to regular users', async () => {
      const courseId = '22f38dae-00f1-49ff-8f3f-0dd6539af032';
      await request(app.getHttpServer())
        .get(`${endpoint}/${courseId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDto<CourseResponseDto> }) => {
            const { links } = body;
            const expectedLinks = expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining(`${endpoint}/${courseId}`),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'get-all',
                href: expect.stringContaining(endpoint),
                method: HttpMethod.GET,
              }),
            ]);

            expect(links).toEqual(expectedLinks);
          },
        );
    });
  });

  describe('POST - /course', () => {
    it('Should create a new course', async () => {
      const createCourseDto = {
        title: 'Introduction to Programming 2',
        description: 'Learn the basics of programming with JavaScript 2',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.BEGINNER,
      } as CreateCourseDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .field('title', createCourseDto.title as string)
        .field('description', createCourseDto.description as string)
        .field('price', createCourseDto.price as number)
        .field('status', createCourseDto.status as PublishStatus)
        .field('difficulty', createCourseDto.difficulty as Difficulty)
        .attach('image', imageMock)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CourseResponseDto> }) => {
            const { id } = body.data;

            const expectedResponse = {
              data: expect.objectContaining({
                type: 'course',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  instructorId: expect.any(String),
                  title: createCourseDto.title,
                  description: createCourseDto.description,
                  price: createCourseDto.price,
                  imageUrl: 'test-url',
                  status: createCourseDto.status,
                  slug: 'introduction-to-programming-2',
                  difficulty: Difficulty.BEGINNER,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'get',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'update',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'delete',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.DELETE,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should generate a different slug if the title already exists', async () => {
      const firstCreateCourseDto = {
        title: 'Introduction to Fishing',
        description: 'Learn the basics of fishing',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.BEGINNER,
      } as CreateCourseDto;
      const secondCreateCourseDto = {
        title: 'Introduction to Fishing',
        description: 'Learn the basics of fishing',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.INTERMEDIATE,
      } as CreateCourseDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .field('title', firstCreateCourseDto.title as string)
        .field('description', firstCreateCourseDto.description as string)
        .field('price', firstCreateCourseDto.price as number)
        .field('status', firstCreateCourseDto.status as PublishStatus)
        .field('difficulty', firstCreateCourseDto.difficulty as Difficulty)
        .attach('image', imageMock)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CourseResponseDto> }) => {
            const { id } = body.data;
            const expectedResponse = {
              data: expect.objectContaining({
                type: 'course',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  title: firstCreateCourseDto.title,
                  description: firstCreateCourseDto.description,
                  price: firstCreateCourseDto.price,
                  imageUrl: 'test-url',
                  status: firstCreateCourseDto.status,
                  slug: 'introduction-to-fishing',
                  difficulty: Difficulty.BEGINNER,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'get',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'update',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'delete',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.DELETE,
                }),
              ]),
            };
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .field('title', secondCreateCourseDto.title as string)
        .field('description', secondCreateCourseDto.description as string)
        .field('price', secondCreateCourseDto.price as number)
        .field('status', secondCreateCourseDto.status as PublishStatus)
        .field('difficulty', secondCreateCourseDto.difficulty as Difficulty)
        .attach('image', imageMock)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = {
            data: expect.objectContaining({
              type: 'course',
              id: expect.any(String),
              attributes: expect.objectContaining({
                title: secondCreateCourseDto.title,
                description: secondCreateCourseDto.description,
                price: secondCreateCourseDto.price,
                imageUrl: 'test-url',
                status: secondCreateCourseDto.status,
                slug: 'introduction-to-fishing-2',
                difficulty: Difficulty.INTERMEDIATE,
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

    it('Should deny access to regular users', async () => {
      const createCourseDto = {
        title: 'Introduction to Programming 2',
        description: 'Learn the basics of programming with JavaScript 2',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.BEGINNER,
      } as CreateCourseDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(regularToken, { type: 'bearer' })
        .send(createCourseDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('Should validate oversize file', async () => {
      const createCourseDto = {
        title: 'Introduction to Programming 2',
        description: 'Learn the basics of programming with JavaScript 2',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.BEGINNER,
      } as CreateCourseDto;
      const oversizedImageMock = createLargeMockFile('image.jpg', 100);

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .field('title', createCourseDto.title as string)
        .field('description', createCourseDto.description as string)
        .field('price', createCourseDto.price as number)
        .field('status', createCourseDto.status as PublishStatus)
        .field('difficulty', createCourseDto.difficulty as Difficulty)
        .attach('image', oversizedImageMock)
        .expect(HttpStatus.PAYLOAD_TOO_LARGE)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: expect.objectContaining({
              status: HttpStatus.PAYLOAD_TOO_LARGE.toString(),
              title: 'File too large',
              source: expect.objectContaining({
                pointer: endpoint,
              }),
              detail: `File "image.jpg" exceeds the maximum size of ${MBTransformer.toMB(MAX_FILE_SIZES[ImageFormat.JPG as keyof typeof MAX_FILE_SIZES]).toFixed(1)} MB.`,
            }),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should validate invalid file format', async () => {
      const createCourseDto = {
        title: 'Introduction to Programming 2',
        description: 'Learn the basics of programming with JavaScript 2',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.BEGINNER,
      } as CreateCourseDto;

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .field('title', createCourseDto.title as string)
        .field('description', createCourseDto.description as string)
        .field('price', createCourseDto.price as number)
        .field('status', createCourseDto.status as PublishStatus)
        .field('difficulty', createCourseDto.difficulty as Difficulty)
        .attach('image', txtMock)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedExtensions = Object.values(ImageFormat).join(', .');
          const expectedResponse = expect.objectContaining({
            error: expect.objectContaining({
              status: HttpStatus.BAD_REQUEST.toString(),
              source: expect.objectContaining({
                pointer: endpoint,
              }),
              title: 'Wrong format',
              detail: `File "txt.txt" is invalid. Only .${expectedExtensions} formats are allowed for image field.`,
            }),
          });

          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /course/:id', () => {
    it('Should update an existing course', async () => {
      const createCourseDto = {
        title: 'Introduction to English',
        description: 'Learn the basics of english',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.BEGINNER,
      } as CreateCourseDto;

      const updateCourseDto = {
        title: 'Introduction to English Language',
        description: 'Learn the basics of English language',
        price: 49.99,
        status: PublishStatus.published,
        difficulty: Difficulty.BEGINNER,
      } as UpdateCourseDto;

      let courseId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .field('title', createCourseDto.title as string)
        .field('description', createCourseDto.description as string)
        .field('price', createCourseDto.price as number)
        .field('status', createCourseDto.status as PublishStatus)
        .field('difficulty', createCourseDto.difficulty as Difficulty)
        .attach('image', imageMock)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CourseResponseDto> }) => {
            const { id } = body.data;
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'course',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  instructorId: expect.any(String),
                  title: createCourseDto.title,
                  description: createCourseDto.description,
                  price: createCourseDto.price,
                  imageUrl: 'test-url',
                  status: createCourseDto.status,
                  slug: 'introduction-to-english',
                  difficulty: Difficulty.BEGINNER,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'get',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'update',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'delete',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.DELETE,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
            courseId = body.data.id as string;
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${courseId}`)
        .auth(adminToken, { type: 'bearer' })
        .field('title', updateCourseDto.title as string)
        .field('description', updateCourseDto.description as string)
        .field('price', updateCourseDto.price as number)
        .field('status', updateCourseDto.status as PublishStatus)
        .field('difficulty', updateCourseDto.difficulty as Difficulty)
        .attach('image', imageMock)
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDto<CourseResponseDto> }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'course',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  instructorId: expect.any(String),
                  title: updateCourseDto.title,
                  description: updateCourseDto.description,
                  price: updateCourseDto.price,
                  imageUrl: 'test-url',
                  status: updateCourseDto.status,
                  slug: 'introduction-to-english',
                  difficulty: Difficulty.BEGINNER,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(`${endpoint}/${courseId}`),
                  rel: 'get',
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(`${endpoint}/${courseId}`),
                  rel: 'delete',
                  method: HttpMethod.DELETE,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if course to update is not found', async () => {
      const nonExistingCourseId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';

      await request(app.getHttpServer())
        .patch(`${endpoint}/${nonExistingCourseId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCourseId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingCourseId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to regular users', async () => {
      const existingCourseId = '22f38dae-00f1-49ff-8f3f-0dd6539af032';
      const updateCourseDto = {
        title: 'Introduction to Programming 2',
      } as UpdateCourseDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${existingCourseId}`)
        .auth(regularToken, { type: 'bearer' })
        .send(updateCourseDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('Should deny access to non instructors admins', async () => {
      const existingCourseId = '22f38dae-00f1-49ff-8f3f-0dd6539af032';
      const updateCourseDto = {
        title: 'Introduction to Programming 2',
      } as UpdateCourseDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${existingCourseId}`)
        .auth(secondAdminToken, { type: 'bearer' })
        .send(updateCourseDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('Should deny course publishing when with empty fields', async () => {
      const createCourseDto = {} as CreateCourseDto;
      const updateCourseDto = {
        status: PublishStatus.published,
      } as UpdateCourseDto;
      let courseId = '';
      const requiredFields: Array<keyof Course> = [
        'title',
        'description',
        'price',
        'imageUrl',
        'difficulty',
      ];

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .send(createCourseDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CourseResponseDto> }) => {
            courseId = body.data.id as string;
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                id: expect.any(String),
                attributes: expect.objectContaining({
                  status: PublishStatus.drafted,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${courseId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateCourseDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              source: {
                pointer: `${endpoint}/${courseId}`,
              },
              status: HttpStatus.BAD_REQUEST.toString(),
              title: 'Bad request',
              detail: `Cannot publish course: missing required fields: ${requiredFields.join(', ')}`,
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('DELETE - /course/:id', () => {
    it('Should delete an existing course', async () => {
      const createCourseDto = {
        title: 'Introduction to football',
        description: 'Learn the basics of football',
        price: 49.99,
        status: PublishStatus.drafted,
        difficulty: Difficulty.BEGINNER,
      } as CreateCourseDto;

      let courseId: string = '';

      await request(app.getHttpServer())
        .post(endpoint)
        .auth(adminToken, { type: 'bearer' })
        .field('title', createCourseDto.title as string)
        .field('description', createCourseDto.description as string)
        .field('price', createCourseDto.price as number)
        .field('status', createCourseDto.status as PublishStatus)
        .field('difficulty', createCourseDto.difficulty as Difficulty)
        .attach('image', imageMock)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<CourseResponseDto> }) => {
            const { id } = body.data;
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'course',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  instructorId: expect.any(String),
                  title: createCourseDto.title,
                  description: createCourseDto.description,
                  price: createCourseDto.price,
                  imageUrl: 'test-url',
                  status: createCourseDto.status,
                  slug: 'introduction-to-football',
                  difficulty: Difficulty.BEGINNER,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'get',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  rel: 'update',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'delete',
                  href: expect.stringContaining(`${endpoint}/${id}`),
                  method: HttpMethod.DELETE,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
            courseId = body.data.id as string;
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${courseId}`)
        .auth(adminToken, { type: 'bearer' })
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
                  message: `The course with id ${courseId} has been deleted successfully`,
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
                  href: expect.stringContaining(endpoint),
                  rel: 'get-all',
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(endpoint),
                  rel: 'create',
                  method: HttpMethod.POST,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if course to delete is not found', async () => {
      const nonExistingCourseId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';

      await request(app.getHttpServer())
        .delete(`${endpoint}/${nonExistingCourseId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingCourseId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingCourseId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to regular users', async () => {
      const existingCourseId = '22f38dae-00f1-49ff-8f3f-0dd6539af032';

      await request(app.getHttpServer())
        .delete(`${endpoint}/${existingCourseId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('Should deny access to non instructors admins', async () => {
      const existingCourseId = '22f38dae-00f1-49ff-8f3f-0dd6539af032';

      await request(app.getHttpServer())
        .del(`${endpoint}/${existingCourseId}`)
        .auth(secondAdminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
