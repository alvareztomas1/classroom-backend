/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { SerializedResponseDtoCollection } from '@common/base/application/dto/serialized-response.dto';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserDto } from '@module/iam/user/application/dto/user.dto';
import { User } from '@module/iam/user/domain/user.entity';

describe('User Module', () => {
  let app: NestExpressApplication;

  const adminToken = createAccessToken({
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

  describe('GET - /user', () => {
    it('Should return paginated users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user?page[size]=10')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                type: User.getEntityName(),
                id: expect.any(String),
                attributes: expect.objectContaining({
                  email: expect.any(String),
                  firstName: expect.any(String),
                  lastName: expect.any(String),
                  avatarUrl: expect.any(String),
                  externalId: expect.any(String),
                  role: expect.any(String),
                  isVerified: expect.any(Boolean),
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
      const firstName = 'admin-name';

      await request(app.getHttpServer())
        .get(`/api/v1/user?page[size]=10&filter[firstName]=${firstName}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  firstName,
                }),
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should allow to sort by attributes', async () => {
      const firstUser = { firstName: '' } as UserDto;
      const lastUser = { firstName: '' } as UserDto;
      let pageCount: number;

      await request(app.getHttpServer())
        .get('/api/v1/user?sort[firstName]=DESC&page[size]=10')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<UserResponseDto>;
          }) => {
            firstUser.firstName = body.data[0].attributes.firstName;
            pageCount = body.meta.pageCount;
          },
        );

      await request(app.getHttpServer())
        .get(
          `/api/v1/user?page[size]=10&sort[firstName]=ASC&page[number]=${pageCount}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({
            body,
          }: {
            body: SerializedResponseDtoCollection<UserResponseDto>;
          }) => {
            const resources = body.data;
            lastUser.firstName =
              resources[resources.length - 1].attributes.firstName;
            expect(lastUser.firstName).toBe(firstUser.firstName);
          },
        );
    });

    it('Should allow to select specific attributes', async () => {
      const attributes = [
        'firstName',
        'externalId',
        'role',
      ] as (keyof UserDto)[];

      await request(app.getHttpServer())
        .get(
          `/api/v1/user?page[size]=10&fields[target]=${attributes.join(',')}`,
        )
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDtoCollection<UserDto> }) => {
            const resourceAttributes = body.data[0].attributes;
            expect(Object.keys(resourceAttributes).length).toBe(
              attributes.length,
            );
            expect(resourceAttributes).toEqual({
              firstName: expect.any(String),
              externalId: expect.any(String),
              role: expect.any(String),
            });
          },
        );
    });
  });

  describe('GET - /user/me', () => {
    it('Should return current user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                firstName: expect.any(String),
                lastName: expect.any(String),
                email: expect.any(String),
                avatarUrl: expect.any(String),
                externalId: expect.any(String),
                isVerified: expect.any(Boolean),
                role: expect.any(String),
              }),
              id: expect.any(String),
              type: 'user',
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.any(String),
                method: HttpMethod.GET,
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
