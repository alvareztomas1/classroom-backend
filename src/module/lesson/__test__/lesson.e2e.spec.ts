/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { SerializedResponseDto } from '@common/base/application/dto/serialized-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CreateLessonDto } from '@module/lesson/application/dto/create-lesson.dto';
import { LessonResponseDto } from '@module/lesson/application/dto/lesson-response.dto';
import { UpdateLessonDto } from '@module/lesson/application/dto/update-lesson.dto';

describe('Lesson Module', () => {
  let app: NestExpressApplication;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Y',
  });

  const fileMock = path.resolve(
    __dirname,
    '../../../test/__mocks__/avatar.jpg',
  );

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
  const existingIds = {
    course: {
      first: 'c62801a2-0d74-4dd7-a20c-11c25be00a2a',
      second: 'b894ad66-ea0a-4ed3-822b-fea66d3a9e49',
    },
    section: {
      first: '31487427-8f89-4e65-bd09-fb84ab56775b',
      second: 'e231901b-57a6-47c0-b84d-d58ce150a315',
      third: '10950e31-025b-4328-b0c1-e3d7062e5fae',
    },
  };

  describe('GET - /course/:courseId/section/:sectionId/lesson/:id', () => {
    it('Should get a lesson by id', async () => {
      const createLessonDto = {
        title: 'Lesson 1',
        description: 'Description 1',
      } as CreateLessonDto;
      let lessonId: string = '';

      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .field('title', createLessonDto.title as string)
        .field('description', createLessonDto.description as string)
        .attach('file', fileMock)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<LessonResponseDto> }) => {
            lessonId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'lesson',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  courseId: existingIds.course.first,
                  sectionId: existingIds.section.first,
                  title: createLessonDto.title,
                  description: createLessonDto.description,
                  url: 'test-url',
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          },
        );

      return await request(app.getHttpServer())
        .get(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDto<LessonResponseDto> }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'lesson',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  courseId: existingIds.course.first,
                  sectionId: existingIds.section.first,
                  title: createLessonDto.title,
                  description: createLessonDto.description,
                  url: 'test-url',
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                  ),
                  rel: 'self',
                  method: HttpMethod.GET,
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if the lesson does not exist', async () => {
      const nonExistingId = '1cfdc342-2a53-4fe7-9e23-31d51b526cd8';

      return await request(app.getHttpServer())
        .get(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${nonExistingId}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingId} not found`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${nonExistingId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('POST - /course/:courseId/section/:sectionId/lesson', () => {
    it('Should create a lesson', async () => {
      const createLessonDto = {
        title: 'Lesson 1',
        description: 'Description 1',
      } as CreateLessonDto;

      return await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .field('title', createLessonDto.title as string)
        .field('description', createLessonDto.description as string)
        .attach('file', fileMock)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'lesson',
              id: expect.any(String),
              attributes: expect.objectContaining({
                courseId: existingIds.course.first,
                sectionId: existingIds.section.first,
                title: createLessonDto.title,
                description: createLessonDto.description,
                url: 'test-url',
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                href: expect.stringContaining(
                  `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                ),
                rel: 'self',
                method: HttpMethod.POST,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /course/:courseId/section/:sectionId/lesson/:id', () => {
    it('Should update a lesson', async () => {
      const createLessonDto = {
        title: 'Lesson 1',
        description: 'Description 1',
      } as CreateLessonDto;
      const updateLessonDto = {
        title: 'Edited',
      } as UpdateLessonDto;
      let lessonId: string = '';

      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .field('title', createLessonDto.title as string)
        .field('description', createLessonDto.description as string)
        .attach('file', fileMock)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<LessonResponseDto> }) => {
            lessonId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'lesson',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  courseId: existingIds.course.first,
                  sectionId: existingIds.section.first,
                  title: createLessonDto.title,
                  description: createLessonDto.description,
                  url: 'test-url',
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          },
        );

      return await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
        )
        .field('title', updateLessonDto.title as string)
        .attach('file', fileMock)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'lesson',
              id: expect.any(String),
              attributes: expect.objectContaining({
                courseId: existingIds.course.first,
                sectionId: existingIds.section.first,
                title: updateLessonDto.title,
                description: createLessonDto.description,
                url: 'test-url',
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                href: expect.stringContaining(
                  `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                ),
                rel: 'self',
                method: HttpMethod.PATCH,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the lesson does not exist', async () => {
      const nonExistingId = '1cfdc342-2a53-4fe7-9e23-31d51b526cd8';
      const updateLessonDto = {
        title: 'Edited',
      } as UpdateLessonDto;

      return await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${nonExistingId}`,
        )
        .send(updateLessonDto)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingId} not found`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${nonExistingId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('DELETE - /course/:courseId/section/:sectionId/lesson/:id', () => {
    it('Should delete a lesson', async () => {
      const createLessonDto = {
        title: 'Lesson 1',
        description: 'Description 1',
      } as CreateLessonDto;
      let lessonId: string = '';

      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .field('title', createLessonDto.title as string)
        .field('description', createLessonDto.description as string)
        .attach('file', fileMock)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<LessonResponseDto> }) => {
            lessonId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'lesson',
                id: expect.any(String),
                attributes: expect.objectContaining({
                  courseId: existingIds.course.first,
                  sectionId: existingIds.section.first,
                  title: createLessonDto.title,
                  description: createLessonDto.description,
                  url: 'test-url',
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: 'operation',
              attributes: expect.objectContaining({
                message: `The lesson with id ${lessonId} has been deleted successfully`,
                success: true,
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                href: expect.stringContaining(
                  `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                ),
                rel: 'self',
                method: HttpMethod.DELETE,
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });

      await request(app.getHttpServer())
        .get(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${lessonId} not found`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the lesson does not exist', async () => {
      const nonExistingId = '1cfdc342-2a53-4fe7-9e23-31d51b526cd8';

      return await request(app.getHttpServer())
        .delete(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${nonExistingId}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingId} not found`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${nonExistingId}`,
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
