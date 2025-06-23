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
import { ImageFormat } from '@common/base/application/enum/file-format.enum';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { MBTransformer } from '@common/transformers/mb.transformer';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken, createLargeMockFile } from '@test/test.util';

import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { UserResponseDto } from '@module/iam/user/application/dto/user-response.dto';
import { UserDto } from '@module/iam/user/application/dto/user.dto';
import { User } from '@module/iam/user/domain/user.entity';

describe('User Module', () => {
  let app: NestExpressApplication;

  const superAdminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });
  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000Y',
  });

  const imageMock = path.resolve(
    __dirname,
    '../../../../test/__mocks__/avatar.jpg',
  );

  const txtMock = path.resolve(__dirname, '../../../../test/__mocks__/txt.txt');

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
        .auth(superAdminToken, { type: 'bearer' })
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
                  roles: expect.arrayContaining([expect.any(String)]),
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
      const firstName = 'super-admin-name';

      await request(app.getHttpServer())
        .get(`/api/v1/user?page[size]=10&filter[firstName]=${firstName}`)
        .auth(superAdminToken, { type: 'bearer' })
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
      let pageCount: number = 0;

      await request(app.getHttpServer())
        .get('/api/v1/user?sort[firstName]=DESC&page[size]=10')
        .auth(superAdminToken, { type: 'bearer' })
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
        .auth(superAdminToken, { type: 'bearer' })
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
        'roles',
      ] as (keyof UserDto)[];

      await request(app.getHttpServer())
        .get(
          `/api/v1/user?page[size]=10&fields[target]=${attributes.join(',')}`,
        )
        .auth(superAdminToken, { type: 'bearer' })
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
              roles: expect.arrayContaining([expect.any(String)]),
            });
          },
        );
    });

    it('Should allow filter by roles as string comma separated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user?filter[roles]=regular,admin,superAdmin')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDtoCollection<UserDto> }) => {
            expect(body.data).toHaveLength(1);
            const resourceAttributes = body.data[0].attributes;
            expect(resourceAttributes.roles).toEqual(
              expect.arrayContaining([AppRole.Regular, AppRole.Admin]),
            );
          },
        );

      await request(app.getHttpServer())
        .get('/api/v1/user?filter[roles]=regular')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(
          ({ body }: { body: SerializedResponseDtoCollection<UserDto> }) => {
            const { data } = body;
            data.forEach((user) => {
              expect(user.attributes.roles).toEqual(
                expect.arrayContaining([AppRole.Regular]),
              );
            });
          },
        );
    });

    it('Should deny access to non-super-admin users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }) => {
          const expectedBody = expect.objectContaining({
            error: expect.objectContaining({
              status: HttpStatus.FORBIDDEN.toString(),
              source: expect.objectContaining({
                pointer: '/api/v1/user',
              }),
              title: 'Forbidden',
              detail: 'You are not allowed to READ this resource',
            }),
          });

          expect(body).toEqual(expectedBody);
        });
    });
  });

  describe('GET - /user/me', () => {
    it('Should return current user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .auth(superAdminToken, { type: 'bearer' })
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
                roles: expect.arrayContaining([expect.any(String)]),
              }),
              id: expect.any(String),
              type: 'user',
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                rel: 'self',
                href: expect.stringContaining('user/me'),
                method: HttpMethod.GET,
              }),
              expect.objectContaining({
                rel: 'update-me',
                href: expect.stringContaining('user/me'),
                method: HttpMethod.PATCH,
              }),
              expect.objectContaining({
                rel: 'get-all',
                href: expect.stringContaining('user'),
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

    it('Should filter get all method from non-super-admin users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }: { body: SerializedResponseDto<UserResponseDto> }) => {
          const { links } = body;
          const expectedLinks = [
            expect.objectContaining({
              rel: 'self',
              href: expect.stringContaining('user/me'),
              method: HttpMethod.GET,
            }),
            expect.objectContaining({
              rel: 'update-me',
              href: expect.stringContaining('user/me'),
              method: HttpMethod.PATCH,
            }),
          ];

          expect(links).toEqual(expectedLinks);
        });
    });
  });

  describe('PATCH - /user/me', () => {
    it('Should update current user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .auth(superAdminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                firstName: 'super-admin-name',
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });

      await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .auth(superAdminToken, { type: 'bearer' })
        .field({ firstName: 'updated' })
        .attach('avatar', imageMock)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                firstName: 'updated',
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .send({ firstName: 'updated' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Should validate oversized avatar file', async () => {
      const oversizedFile = createLargeMockFile('avatar.jpg', 100);
      await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .auth(superAdminToken, { type: 'bearer' })
        .field({ firstName: 'updated' })
        .attach('avatar', oversizedFile)
        .expect(HttpStatus.PAYLOAD_TOO_LARGE)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: expect.objectContaining({
              status: HttpStatus.PAYLOAD_TOO_LARGE.toString(),
              title: 'File too large',
              source: expect.objectContaining({
                pointer: '/api/v1/user/me',
              }),
              detail: `File "avatar.jpg" exceeds the maximum size of ${MBTransformer.toMB(MAX_FILE_SIZES[ImageFormat.JPG as keyof typeof MAX_FILE_SIZES]).toFixed(1)} MB.`,
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should validate wrong avatar file format', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .auth(superAdminToken, { type: 'bearer' })
        .field({ firstName: 'updated' })
        .attach('avatar', txtMock)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            error: expect.objectContaining({
              detail: `File "txt.txt" is invalid. Only .${Object.values(ImageFormat).join(', .')} formats are allowed for avatar field.`,
              status: HttpStatus.BAD_REQUEST.toString(),
              source: expect.objectContaining({
                pointer: '/api/v1/user/me',
              }),
              title: 'Wrong format',
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });
});
