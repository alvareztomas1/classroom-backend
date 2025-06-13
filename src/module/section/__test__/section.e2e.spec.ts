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

import { SectionResponseDto } from '@module/section/application/dto/section.response.dto';
import { UpdateSectionDto } from '@module/section/application/dto/update.section.dto';

import { CreateSectionDto } from '../application/dto/create.section.dto';

describe('Course Module', () => {
  let app: NestExpressApplication;

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

  const endpoint = '/api/v1/course';
  const existingCourseId = 'c62801a2-0d74-4dd7-a20c-11c25be00a2a';

  describe('POST - /section', () => {
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
  });

  describe('PATCH - /section/:id', () => {
    it('Should update section', async () => {
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;
      let sectionId: string;

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id;

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
              detail: `Entity with id ${nonExistingSectionId} not found`,
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
  });

  describe('DELETE - /section/:id', () => {
    it('Should delete section', async () => {
      const createSectionDto = {
        title: 'Section 1',
        description: 'Description 1',
        position: 0,
      } as CreateSectionDto;

      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;

      let sectionId: string;

      await request(app.getHttpServer())
        .post(`${endpoint}/${existingCourseId}/section`)
        .auth(adminToken, { type: 'bearer' })
        .send(createSectionDto)
        .expect(HttpStatus.CREATED)
        .then(
          ({ body }: { body: SerializedResponseDto<SectionResponseDto> }) => {
            sectionId = body.data.id;

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
              detail: `Entity with id ${sectionId} not found`,
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
              detail: `Entity with id ${nonExistingSectionId} not found`,
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
  });
});
