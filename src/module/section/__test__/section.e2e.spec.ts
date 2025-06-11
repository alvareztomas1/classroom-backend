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

  const endpoint = '/api/v1/section';

  describe('PATCH - /section/:id', () => {
    it('Should update section', async () => {
      const sectionId = 'ebe088b2-4d9c-4b06-9215-abb777f77115';
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${sectionId}`)
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
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.PATCH,
                }),
                expect.objectContaining({
                  rel: 'delete-section',
                  href: expect.stringContaining(`${endpoint}/${sectionId}`),
                  method: HttpMethod.DELETE,
                }),
              ]),
            });
            expect(body).toEqual(expectedResponse);
          },
        );
    });

    it('Should throw an error if section does not exist', async () => {
      const nonExistingSectionId = '22f38dae-00f1-49ff-8f3f-0dd6539af039';
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;

      await request(app.getHttpServer())
        .patch(`${endpoint}/${nonExistingSectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingSectionId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingSectionId}`,
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
      const sectionId = 'ebe088b2-4d9c-4b06-9215-abb777f77115';
      const updateSectionDto = {
        title: 'Updated',
      } as UpdateSectionDto;
      await request(app.getHttpServer())
        .delete(`${endpoint}/${sectionId}`)
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
                  href: expect.stringContaining(endpoint),
                  rel: 'self',
                  method: HttpMethod.DELETE,
                }),
              ]),
            });

            expect(body).toEqual(expectedResponse);
          },
        );

      await request(app.getHttpServer())
        .patch(`${endpoint}/${sectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateSectionDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${sectionId} not found`,
              source: {
                pointer: `${endpoint}/${sectionId}`,
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
        .delete(`${endpoint}/${nonExistingSectionId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: {
              detail: `Entity with id ${nonExistingSectionId} not found`,
              source: {
                pointer: `${endpoint}/${nonExistingSectionId}`,
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
