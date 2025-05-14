/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { HttpMethod } from '@common/base/application/enum/http-method.enum';

import { setupApp } from '@config/app.config';

import { SignUpDto } from '@module/iam/authentication/application/dto/sign-up.dto';
import { PASSWORD_VALIDATION_ERROR } from '@module/iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@module/iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { PasswordValidationException } from '@module/iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { AppRole } from '@module/iam/authorization/domain/app-role.enum';
import { User } from '@module/iam/user/domain/user.entity';

import {
  identityProviderServiceMock,
  testModuleBootstrapper,
} from '@/test/test.module.bootstrapper';

describe('Authentication Module', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication();
    setupApp(app);

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST - /auth/sign-up', () => {
    it('Should allow users to sign up', async () => {
      const externalId = '00000000-0000-0000-0000-000000000001';
      identityProviderServiceMock.signUp.mockResolvedValueOnce({
        externalId,
      });

      const signUpDto: SignUpDto = {
        email: 'john.doe@test.com',
        password: '$Test123',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://gravatar.com/avatar/1234567890',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              data: expect.objectContaining({
                type: User.getEntityName(),
                id: expect.any(String),
                attributes: expect.objectContaining({
                  email: signUpDto.email,
                  externalId,
                  firstName: signUpDto.firstName,
                  lastName: signUpDto.lastName,
                  avatarUrl: signUpDto.avatarUrl,
                  role: AppRole.Regular,
                  isVerified: false,
                }),
              }),
              links: expect.objectContaining({
                self: expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-up'),
                  rel: 'self',
                  method: HttpMethod.GET,
                }),
              }),
            }),
          );
        });
    });

    it('Should allow users to retry their sign up if the external provider failed', async () => {
      identityProviderServiceMock.signUp.mockRejectedValueOnce(
        new CouldNotSignUpException('Could not sign up'),
      );

      const signUpDto: SignUpDto = {
        email: 'jane.doe@test.com',
        password: '$Test123',
        firstName: 'Jane',
        lastName: 'Doe',
        avatarUrl: 'https://gravatar.com/avatar/1234567890',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      const externalId = '00000000-0000-0000-0000-000000000002';
      identityProviderServiceMock.signUp.mockResolvedValueOnce({
        externalId,
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              data: expect.objectContaining({
                type: User.getEntityName(),
                id: expect.any(String),
                attributes: expect.objectContaining({
                  email: signUpDto.email,
                  externalId,
                  firstName: signUpDto.firstName,
                  lastName: signUpDto.lastName,
                  avatarUrl: signUpDto.avatarUrl,
                  role: AppRole.Regular,
                  isVerified: false,
                }),
              }),
              links: expect.objectContaining({
                self: expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-up'),
                  rel: 'self',
                  method: HttpMethod.GET,
                }),
              }),
            }),
          );
        });
    });

    it('Should throw an error if user already signed up', async () => {
      const externalId = '00000000-0000-0000-0000-000000000003';
      identityProviderServiceMock.signUp.mockResolvedValueOnce({
        externalId,
      });

      const signUpDto: SignUpDto = {
        email: 'thomas.doe@test.com',
        password: '$Test123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              data: expect.objectContaining({
                type: User.getEntityName(),
                id: expect.any(String),
                attributes: expect.objectContaining({
                  email: signUpDto.email,
                  externalId,
                  firstName: signUpDto.firstName,
                  lastName: signUpDto.lastName,
                  role: AppRole.Regular,
                  isVerified: false,
                }),
              }),
              links: expect.objectContaining({
                self: expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-up'),
                  rel: 'self',
                  method: HttpMethod.GET,
                }),
              }),
            }),
          );
        });

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect((body as { message: string }).message).toBe(
            'User already signed up',
          );
        });
    });

    it('Should throw an error if password is invalid', async () => {
      const expectedError = new PasswordValidationException(
        PASSWORD_VALIDATION_ERROR,
      );
      identityProviderServiceMock.signUp.mockRejectedValueOnce(expectedError);
      const signUpDto: SignUpDto = {
        email: 'some@account.com',
        password: '123456',
        firstName: 'test',
        lastName: 'test',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect((body as { message: string }).message).toEqual(
            expectedError.message,
          );
        });
    });
  });
});
