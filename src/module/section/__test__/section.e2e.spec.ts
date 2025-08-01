/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { loadFixtures } from '@data/util/fixture-loader';

import { SerializedResponseDto } from '@common/base/application/dto/serialized-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { AppAction } from '@iam/authorization/domain/app.action.enum';

import { SectionResponseDto } from '@section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@section/application/dto/update.section.dto';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { CreateSectionDto } from '../application/dto/create.section.dto';

describe('Course Module', () => {
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
  const existingCourseId = 'c62801a2-0d74-4dd7-a20c-11c25be00a2a';
  const secondExistingCourseId = 'b894ad66-ea0a-4ed3-822b-fea66d3a9e49';

  describe('POST - /course/:courseId/section', () => {
    it('Should create a section', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            const sectionId = body.data.id;
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should deny access to regular users', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(regularToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Create.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the course does not exist', async () => {
      const nonExistingCourseId = '1c9c3688-64b3-4bf0-8481-bd8aa16ce134';
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;

      await request(app.getHttpServer())
        .post(`${endpoint}/${nonExistingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Course with id ${nonExistingCourseId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingCourseId}/section`,
              },
              status: HttpStatus.NOT_FOUND.toString(),
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non instructors admins', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(secondAdminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Create.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should grant access to non instructor super admins', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('PATCH - /course/:courseId/section/:id', () => {
    it('Should update section', async () => {
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: 'Updated',
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                  rel: 'self',
                  method: HttpMethod.PATCH,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if section does not exist', async () => {
      const existingCourseId = 'c62801a2-0d74-4dd7-a20c-11c25be00a2a';

      const nonExistingSectionId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;

      await request(app.getHttpServer())
        .patch(
          `${endpoint}/${existingCourseId}/section/${nonExistingSectionId}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Section with id ${nonExistingSectionId} not found`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section/${nonExistingSectionId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the section does not belong to the course', async () => {
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${secondExistingCourseId}/section/${sectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `The section with id ${sectionId} does not belong to the course with id ${secondExistingCourseId}`,
              source: {
                pointer: `${endpoint}/${secondExistingCourseId}/section/${sectionId}`,
              },
              status: '400',
              title: 'Bad request',
            },
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to regular users', async () => {
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(regularToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section/${sectionId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non instructors admins', async () => {
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(secondAdminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Update.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section/${sectionId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should grant access to non instructor super admins', async () => {
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.OK);
    });
  });

  describe('DELETE - /course/:courseId/section/:id', () => {
    it('Should delete a section', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;

      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;

      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: 'operation',
                attributes: expect.objectContaining({
                  message: `The section with id ${sectionId} has been deleted successfully`,
                  success: true,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                  rel: 'self',
                  method: HttpMethod.DELETE,
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Section with id ${sectionId} not found`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section/${sectionId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if section does not exist', async () => {
      const nonExistingSectionId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';

      await request(app.getHttpServer())
        .delete(
          `${endpoint}/${existingCourseId}/section/${nonExistingSectionId}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Section with id ${nonExistingSectionId} not found`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section/${nonExistingSectionId}`,
              },
              status: '404',
              title: 'Entity not found',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if the section does not belong to the course', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${secondExistingCourseId}/section/${sectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `The section with id ${sectionId} does not belong to the course with id ${secondExistingCourseId}`,
              source: {
                pointer: `${endpoint}/${secondExistingCourseId}/section/${sectionId}`,
              },
              status: '400',
              title: 'Bad request',
            },
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to regular users', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(regularToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section/${sectionId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should deny access to non instructors admins', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(secondAdminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `You are not allowed to ${AppAction.Delete.toUpperCase()} this resource`,
              source: {
                pointer: `${endpoint}/${existingCourseId}/section/${sectionId}`,
              },
              status: HttpStatus.FORBIDDEN.toString(),
              title: 'Forbidden',
            },
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should grant access to non instructor super admins', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string = '';

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id as string;

            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  title: createSectionDto.title,
                  description: createSectionDto.description,
                  position: createSectionDto.position,
                  courseId: existingCourseId,
                }),
              }),
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section`,
                  ),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  rel: 'update-section',
                  method: HttpMethod.PATCH,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  method: HttpMethod.DELETE,
                  href: expect.stringContaining(
                    `${endpoint}/${existingCourseId}/section/${sectionId}`,
                  ),
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .delete(`${endpoint}/${existingCourseId}/section/${sectionId}`)
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK);
    });
  });
});
