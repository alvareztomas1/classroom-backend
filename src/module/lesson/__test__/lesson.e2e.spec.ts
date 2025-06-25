/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { MAX_FILE_SIZES } from '@common/base/application/constant/file.constant';
import { SerializedResponseDto } from '@common/base/application/dto/serialized-response.dto';
import { FileFormat } from '@common/base/application/enum/file-format.enum';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { MBTransformer } from '@common/transformers/mb.transformer';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken, createLargeMockFile } from '@test/test.util';

import { AppAction } from '@module/iam/authorization/domain/app.action.enum';
import { CreateLessonDto } from '@module/lesson/application/dto/create-lesson.dto';
import { LessonResponseDto } from '@module/lesson/application/dto/lesson-response.dto';
import { UpdateLessonDto } from '@module/lesson/application/dto/update-lesson.dto';
import { LessonType } from '@module/lesson/domain/lesson.type';

describe('Lesson Module', () => {
  let app: NestExpressApplication;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Y',
  });
  const secondAdminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000W',
  });
  const regularToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Z',
  });
  const superAdminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  const fileMock = path.resolve(__dirname, '../../../test/__mocks__/pdf.pdf');

  const txtMock = path.resolve(__dirname, '../../../test/__mocks__/txt.txt');

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
    lesson: {
      first: '23de5a50-aa82-45f1-996e-7e6730852631',
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
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                  ),
                  rel: 'self',
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                  ),
                  rel: 'create-lesson',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                  ),
                  rel: 'update-lesson',
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                  ),
                  rel: 'delete-lesson',
                  method: HttpMethod.DELETE,
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
    it('Should create lessons with lesson type based on file', async () => {
      const createLessonDto = {
        title: 'Lesson 1',
        description: 'Description 1',
      } as CreateLessonDto;
      const videoMock = createLargeMockFile('video.mp4', 60);
      let lessonId = '';

      await request(app.getHttpServer())
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
                lessonType: LessonType.PDF,
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

      return await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .field('title', createLessonDto.title as string)
        .field('description', createLessonDto.description as string)
        .attach('file', videoMock)
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
                  lessonType: LessonType.VIDEO,
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
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                  ),
                  rel: 'get-lesson',
                  method: HttpMethod.GET,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                  ),
                  rel: 'update-lesson',
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                  ),
                  rel: 'delete-lesson',
                  method: HttpMethod.DELETE,
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error when receiving an invalid file', async () => {
      const createLessonDto = {
        title: 'Lesson 1',
        description: 'Description 1',
      } as CreateLessonDto;

      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .field('title', createLessonDto.title as string)
        .field('description', createLessonDto.description as string)
        .attach('file', txtMock)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedExtensions = Object.values(FileFormat).join(', .');
          const expectedResponse = expect.objectContaining({
            error: expect.objectContaining({
              status: HttpStatus.BAD_REQUEST.toString(),
              source: expect.objectContaining({
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
              }),
              title: 'Wrong format',
              detail: `File "txt.txt" is invalid. Only .${expectedExtensions} formats are allowed for file field.`,
            }),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny lesson creation with oversized file', async () => {
      const largePdfMock = createLargeMockFile('large.pdf', 60);

      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .field('title', 'Lesson Oversized')
        .field('description', 'Test oversized file')
        .attach('file', largePdfMock)
        .expect(HttpStatus.PAYLOAD_TOO_LARGE)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: expect.objectContaining({
              status: HttpStatus.PAYLOAD_TOO_LARGE.toString(),
              title: 'File too large',
              source: expect.objectContaining({
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
              }),
              detail: `File "large.pdf" exceeds the maximum size of ${MBTransformer.toMB(MAX_FILE_SIZES[FileFormat.PDF]).toFixed(1)} MB.`,
            }),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to regular users', async () => {
      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Create.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non instructors admins', async () => {
      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(secondAdminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Create.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should grant access to super admins', async () => {
      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
        )
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.any(Object),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the section does not belong to the course', async () => {
      const nonExistingCourseId = 'f7b7b729-cad2-4aae-a6cc-fa75a80f550b';

      await request(app.getHttpServer())
        .post(
          `${endpoint}/${nonExistingCourseId}/section/${existingIds.section.first}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `The section with id ${existingIds.section.first} does not belong to the course with id ${nonExistingCourseId}`,
              source: {
                pointer: `${endpoint}/${nonExistingCourseId}/section/${existingIds.section.first}/lesson`,
              },
              status: HttpStatus.BAD_REQUEST.toString(),
              title: 'Bad request',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the section does not exists', async () => {
      const nonExistingSectionId = '17aa38f3-507e-44f8-9ffc-a7badebe8fe3';

      await request(app.getHttpServer())
        .post(
          `${endpoint}/${existingIds.course.first}/section/${nonExistingSectionId}/lesson`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingSectionId} not found`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${nonExistingSectionId}/lesson`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
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
      const videoMock = createLargeMockFile('video.mp4', 60);

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
                  lessonType: LessonType.PDF,
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
        .attach('file', videoMock)
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
                lessonType: LessonType.VIDEO,
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
              expect.objectContaining({
                href: expect.stringContaining(
                  `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/`,
                ),
                rel: 'get-lesson',
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                href: expect.stringContaining(
                  `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                ),
                rel: 'create-lesson',
                method: HttpMethod.POST,
              }),
              expect.objectContaining({
                href: expect.stringContaining(
                  `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
                ),
                rel: 'delete-lesson',
                method: HttpMethod.DELETE,
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

    it('Should deny access to regular users', async () => {
      const updateLessonDto = {
        title: 'Edited',
      } as UpdateLessonDto;
      return await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
        )
        .field('title', updateLessonDto.title as string)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non instructors admins', async () => {
      const updateLessonDto = {
        title: 'Edited',
      } as UpdateLessonDto;
      return await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
        )
        .field('title', updateLessonDto.title as string)
        .auth(secondAdminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should grant access to super admins', async () => {
      const updateLessonDto = {
        title: 'Edited',
      } as UpdateLessonDto;
      return await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
        )
        .field('title', updateLessonDto.title as string)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.any(Object),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the lesson does not belong to the section', async () => {
      const updateLessonDto = {
        title: 'Edited',
      } as UpdateLessonDto;
      return await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.third}/lesson/${existingIds.lesson.first}`,
        )
        .field('title', updateLessonDto.title as string)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `The lesson with id ${existingIds.lesson.first} does not belong to the section with id ${existingIds.section.third}`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.third}/lesson/${existingIds.lesson.first}`,
              },
              status: HttpStatus.BAD_REQUEST.toString(),
              title: 'Bad request',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the section does not belong to the course', async () => {
      const updateLessonDto = {
        title: 'Edited',
      } as UpdateLessonDto;
      return await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingIds.course.second}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
        )
        .field('title', updateLessonDto.title as string)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `The section with id ${existingIds.section.first} does not belong to the course with id ${existingIds.course.second}`,
              source: {
                pointer: `${endpoint}/${existingIds.course.second}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
              },
              status: HttpStatus.BAD_REQUEST.toString(),
              title: 'Bad request',
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
              expect.objectContaining({
                href: expect.stringContaining(
                  `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson`,
                ),
                rel: 'create-lesson',
                method: HttpMethod.POST,
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

    it('Should deny access to regular users', async () => {
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
        .delete(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
        )
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non instructors admins', async () => {
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
        .delete(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
        )
        .auth(secondAdminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should grant access to super admins', async () => {
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
        .delete(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.first}/lesson/${lessonId}`,
        )
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.any(Object),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the lesson does not belong to the section', async () => {
      return await request(app.getHttpServer())
        .delete(
          `${endpoint}/${existingIds.course.first}/section/${existingIds.section.third}/lesson/${existingIds.lesson.first}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `The lesson with id ${existingIds.lesson.first} does not belong to the section with id ${existingIds.section.third}`,
              source: {
                pointer: `${endpoint}/${existingIds.course.first}/section/${existingIds.section.third}/lesson/${existingIds.lesson.first}`,
              },
              status: HttpStatus.BAD_REQUEST.toString(),
              title: 'Bad request',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the section does not belong to the course', async () => {
      return await request(app.getHttpServer())
        .delete(
          `${endpoint}/${existingIds.course.second}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `The section with id ${existingIds.section.first} does not belong to the course with id ${existingIds.course.second}`,
              source: {
                pointer: `${endpoint}/${existingIds.course.second}/section/${existingIds.section.first}/lesson/${existingIds.lesson.first}`,
              },
              status: HttpStatus.BAD_REQUEST.toString(),
              title: 'Bad request',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });
});
