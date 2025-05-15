/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { IAppErrorResponse } from '@common/base/application/exception/app-error-response.interface';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { ConfirmUserDto } from '@module/iam/authentication/application/dto/confirm-user.dto';
import { ISignInResponse } from '@module/iam/authentication/application/dto/sign-in-response.dto';
import { SignInDto } from '@module/iam/authentication/application/dto/sign-in.dto';
import { SignUpDto } from '@module/iam/authentication/application/dto/sign-up.dto';
import { USER_ALREADY_CONFIRMED_ERROR } from '@module/iam/authentication/application/exception/authentication-exception-messages';
import { AUTHENTICATION_NAME } from '@module/iam/authentication/domain/authentication.name';
import { CodeMismatchException } from '@module/iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  INVALID_PASSWORD_ERROR,
  NEW_PASSWORD_REQUIRED_ERROR,
  PASSWORD_VALIDATION_ERROR,
  UNEXPECTED_ERROR_CODE_ERROR,
  USER_NOT_CONFIRMED_ERROR,
} from '@module/iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@module/iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@module/iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { InvalidPasswordException } from '@module/iam/authentication/infrastructure/cognito/exception/invalid-password.exception';
import { NewPasswordRequiredException } from '@module/iam/authentication/infrastructure/cognito/exception/new-password-required.exception';
import { PasswordValidationException } from '@module/iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { UnexpectedErrorCodeException } from '@module/iam/authentication/infrastructure/cognito/exception/unexpected-code.exception';
import { UserNotConfirmedException } from '@module/iam/authentication/infrastructure/cognito/exception/user-not-confirmed.exception';
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

  beforeEach(async () => {
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
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
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-up'),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  href: expect.stringContaining('/auth/confirm-user'),
                  rel: 'confirm-user',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-in'),
                  rel: 'sign-in',
                  method: HttpMethod.POST,
                }),
              ]),
            }),
          );
        });
    });

    it('Should allow users to retry their sign up if the external provider failed', async () => {
      identityProviderServiceMock.signUp.mockRejectedValueOnce(
        new CouldNotSignUpException({
          message: 'Could not sign up',
        }),
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
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-up'),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  href: expect.stringContaining('/auth/confirm-user'),
                  rel: 'confirm-user',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-in'),
                  rel: 'sign-in',
                  method: HttpMethod.POST,
                }),
              ]),
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
              links: expect.arrayContaining([
                expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-up'),
                  rel: 'self',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  href: expect.stringContaining('/auth/confirm-user'),
                  rel: 'confirm-user',
                  method: HttpMethod.POST,
                }),
                expect.objectContaining({
                  href: expect.stringContaining('/auth/sign-in'),
                  rel: 'sign-in',
                  method: HttpMethod.POST,
                }),
              ]),
            }),
          );
        });

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }) => {
          expect(body as IAppErrorResponse).toMatchObject(
            expect.objectContaining({
              error: expect.objectContaining({
                detail: 'User already signed up',
                status: HttpStatus.BAD_REQUEST.toString(),
                source: { pointer: '/api/v1/auth/sign-up' },
                title: 'Signup Conflict',
              }),
            }),
          );
        });
    });

    it('Should throw an error if password is invalid', async () => {
      const expectedError = new PasswordValidationException({
        message: PASSWORD_VALIDATION_ERROR,
      });
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
          expect(body as IAppErrorResponse).toMatchObject({
            error: expect.objectContaining({
              detail: expectedError.message,
              status: HttpStatus.BAD_REQUEST.toString(),
              source: { pointer: '/api/v1/auth/sign-up' },
              title: 'Password validation',
            }),
          });
        });
    });
  });

  describe('POST - /auth/confirm-user', () => {
    it('Should confirm a user when provided a correct confirmation code', async () => {
      const successResponse = {
        success: true,
        message: 'User successfully confirmed',
      };
      identityProviderServiceMock.confirmUser.mockResolvedValueOnce(
        successResponse,
      );
      const confirmUserDto: ConfirmUserDto = {
        email: 'test_confirm@email.co',
        code: '123456',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/confirm-user')
        .send(confirmUserDto)
        .expect(HttpStatus.OK)
        .then(({ body }: { body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: AUTHENTICATION_NAME,
              attributes: expect.objectContaining({
                ...successResponse,
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                href: expect.stringContaining('/auth/confirm-user'),
                rel: 'self',
                method: HttpMethod.POST,
              }),
              expect.objectContaining({
                href: expect.stringContaining('/auth/sign-in'),
                rel: 'sign-in',
                method: HttpMethod.POST,
              }),
            ]),
          });

          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should send a UserAlreadyConfirmed error when trying to confirm a confirmed user', async () => {
      const email = 'test_admin@email.co';
      const confirmUserDto: ConfirmUserDto = {
        email,
        code: '123456',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/confirm-user')
        .send(confirmUserDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }: { body: IAppErrorResponse }) => {
          const expectedError: IAppErrorResponse = {
            error: {
              status: HttpStatus.BAD_REQUEST.toString(),
              source: {
                pointer: '/api/v1/auth/confirm-user',
              },
              title: 'User already confirmed',
              detail: USER_ALREADY_CONFIRMED_ERROR,
            },
          };
          expect(body).toEqual(expectedError);
        });
    });

    it('Should send an UserNotFound error when provided an email that does not exist', async () => {
      const email = 'not-existing@email.co';
      const confirmUserDto: ConfirmUserDto = {
        email,
        code: '123456',
      };
      await request(app.getHttpServer())
        .post('/api/v1/auth/confirm-user')
        .send(confirmUserDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }: { body: IAppErrorResponse }) => {
          const expectedError: IAppErrorResponse = {
            error: {
              status: HttpStatus.NOT_FOUND.toString(),
              source: {
                pointer: '/api/v1/auth/confirm-user',
              },
              title: 'Email not found',
              detail: `User with email ${email} was not found`,
            },
          };

          expect(body).toEqual(expectedError);
        });
    });

    it('Should send a CodeMismatch error when provided an incorrect code', async () => {
      const codeMismatchError = new CodeMismatchException({
        message: CODE_MISMATCH_ERROR,
      });

      identityProviderServiceMock.confirmUser.mockImplementationOnce(
        (email: string, code: string) => {
          if (code === '100000') {
            throw codeMismatchError;
          }
          return Promise.resolve({
            success: true,
            message: 'User successfully confirmed',
          });
        },
      );

      const confirmUserDto: ConfirmUserDto = {
        email: 'test_confirm@email.co',
        code: '100000',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/confirm-user')
        .send(confirmUserDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .then(({ body }: { body: IAppErrorResponse }) => {
          const expectedResponse: IAppErrorResponse = {
            error: {
              status: HttpStatus.UNAUTHORIZED.toString(),
              source: {
                pointer: '/api/v1/auth/confirm-user',
              },
              title: 'Code mismatch',
              detail: CODE_MISMATCH_ERROR,
            },
          };
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should send an ExpiredCode error when provided an expired code', async () => {
      const expiredCodeError = new ExpiredCodeException({
        message: EXPIRED_CODE_ERROR,
      });

      identityProviderServiceMock.confirmUser.mockImplementationOnce(
        (email: string, code: string) => {
          if (code === '999999') {
            throw expiredCodeError;
          }
          return Promise.resolve({
            success: true,
            message: 'User successfully confirmed',
          });
        },
      );

      const confirmUserDto: ConfirmUserDto = {
        email: 'test_confirm@email.co',
        code: '999999',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/confirm-user')
        .send(confirmUserDto)
        .expect(HttpStatus.BAD_REQUEST)
        .then(({ body }: { body: IAppErrorResponse }) => {
          const expectedResponse: IAppErrorResponse = {
            error: {
              status: HttpStatus.BAD_REQUEST.toString(),
              source: {
                pointer: '/api/v1/auth/confirm-user',
              },
              title: 'Expired code',
              detail: EXPIRED_CODE_ERROR,
            },
          };
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
      const unexpectedError = new UnexpectedErrorCodeException({
        message: UNEXPECTED_ERROR_CODE_ERROR,
      });

      identityProviderServiceMock.confirmUser.mockImplementationOnce(
        (email: string, code: string) => {
          if (code === '555555') {
            throw unexpectedError;
          }
          return Promise.resolve({
            success: true,
            message: 'User successfully confirmed',
          });
        },
      );

      const confirmUserDto: ConfirmUserDto = {
        email: 'test_confirm@email.co',
        code: '555555',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/confirm-user')
        .send(confirmUserDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(({ body }: { body: IAppErrorResponse }) => {
          const expectedResponse: IAppErrorResponse = {
            error: {
              status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
              source: {
                pointer: '/api/v1/auth/confirm-user',
              },
              title: 'Unexpected error code',
              detail: UNEXPECTED_ERROR_CODE_ERROR,
            },
          };
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('POST - /auth/sign-in', () => {
    it('Should allow users to sign in when provided a correct email and password', async () => {
      const serviceResponse: ISignInResponse = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      identityProviderServiceMock.signIn.mockResolvedValueOnce(serviceResponse);

      const signInDto: SignInDto = {
        email: 'test_admin@email.co',
        password: 'password',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send(signInDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: AUTHENTICATION_NAME,
              attributes: expect.objectContaining({
                ...serviceResponse,
              }),
            }),
            links: expect.arrayContaining([
              expect.objectContaining({
                href: expect.stringContaining('/auth/sign-in'),
                rel: 'self',
                method: HttpMethod.POST,
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('Should send an UserNotFound error when provided an invalid email', async () => {
      const signInDto: SignInDto = {
        email: 'not-existing@email.co',
        password: 'fakePassword',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send(signInDto)
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }: { body: IAppErrorResponse }) => {
          expect(body).toEqual({
            error: expect.objectContaining({
              status: HttpStatus.NOT_FOUND.toString(),
              source: expect.objectContaining({
                pointer: '/api/v1/auth/sign-in',
              }),
              title: 'Email not found',
              detail: `User with email ${signInDto.email} was not found`,
            }),
          });
        });
    });

    it('Should send an InvalidPassword error provided a valid user but invalid password', async () => {
      const error = new InvalidPasswordException({
        message: INVALID_PASSWORD_ERROR,
      });
      const signInDto: SignInDto = {
        email: 'test_admin@email.co',
        password: 'fakePassword',
      };

      identityProviderServiceMock.signIn.mockRejectedValueOnce(error);

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send(signInDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .then(({ body }: { body: IAppErrorResponse }) => {
          expect(body).toEqual({
            error: expect.objectContaining({
              status: HttpStatus.UNAUTHORIZED.toString(),
              source: expect.objectContaining({
                pointer: '/api/v1/auth/sign-in',
              }),
              title: 'Invalid password',
              detail: error.message,
            }),
          });
        });
    });

    it('Should send an UnconfirmedUser error when user is not confirmed', async () => {
      const error = new UserNotConfirmedException({
        message: USER_NOT_CONFIRMED_ERROR,
      });
      identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
      const signInDto: SignInDto = {
        email: 'test_admin@email.co',
        password: 'password',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send(signInDto)
        .expect(HttpStatus.FORBIDDEN)
        .then(({ body }: { body: IAppErrorResponse }) => {
          expect(body).toEqual({
            error: expect.objectContaining({
              status: HttpStatus.FORBIDDEN.toString(),
              source: expect.objectContaining({
                pointer: '/api/v1/auth/sign-in',
              }),
              title: 'User not confirmed',
              detail: error.message,
            }),
          });
        });
    });

    it('Should send an UnexpectedErrorCode error when receiving uncovered error codes', async () => {
      const error = new UnexpectedErrorCodeException({
        message: UNEXPECTED_ERROR_CODE_ERROR,
      });
      identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
      const signInDto: SignInDto = {
        email: 'test_admin@email.co',
        password: 'password',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send(signInDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(({ body }: { body: IAppErrorResponse }) => {
          expect(body).toEqual({
            error: expect.objectContaining({
              status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
              source: expect.objectContaining({
                pointer: '/api/v1/auth/sign-in',
              }),
              title: 'Unexpected error code',
              detail: error.message,
            }),
          });
        });
    });

    it('Should send a NewPasswordRequired error when user needs to update their password', async () => {
      const error = new NewPasswordRequiredException({
        message: NEW_PASSWORD_REQUIRED_ERROR,
      });
      identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
      const signInDto: SignInDto = {
        email: 'test_admin@email.co',
        password: 'password',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send(signInDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .then(({ body }: { body: IAppErrorResponse }) => {
          expect(body).toEqual({
            error: expect.objectContaining({
              status: HttpStatus.UNAUTHORIZED.toString(),
              source: expect.objectContaining({
                pointer: '/api/v1/auth/sign-in',
              }),
              title: 'New password required',
              detail: error.message,
            }),
          });
        });
    });
  });
});
