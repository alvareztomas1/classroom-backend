/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { MAX_FILE_SIZES } from '@common/base/application/constant/file.constant';
import { ImageFormat } from '@common/base/application/enum/file-format.enum';
import { HttpMethod } from '@common/base/application/enum/http-method.enum';
import { IAppErrorResponse } from '@common/base/application/exception/app-error-response.interface';
import { MBTransformer } from '@common/transformers/mb.transformer';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { createAccessToken, createLargeMockFile } from '@test/test.util';

import { ConfirmPasswordDto } from '@module/iam/authentication/application/dto/confirm-password.dto';
import { ConfirmUserDto } from '@module/iam/authentication/application/dto/confirm-user.dto';
import { ForgotPasswordDto } from '@module/iam/authentication/application/dto/forgot-password.dto';
import { IRefreshSessionResponse } from '@module/iam/authentication/application/dto/refresh-session-response.dto';
import { RefreshSessionDto } from '@module/iam/authentication/application/dto/refresh-session.dto';
import { ResendConfirmationCodeDto } from '@module/iam/authentication/application/dto/resend-confirmation-code.dto';
import { ISignInResponse } from '@module/iam/authentication/application/dto/sign-in-response.dto';
import { SignInDto } from '@module/iam/authentication/application/dto/sign-in.dto';
import { SignUpDto } from '@module/iam/authentication/application/dto/sign-up.dto';
import {
  TOKEN_EXPIRED_ERROR,
  USER_ALREADY_CONFIRMED_ERROR,
} from '@module/iam/authentication/application/exception/authentication-exception-messages';
import { TokenExpiredException } from '@module/iam/authentication/application/exception/token-expired.exception';
import { AUTHENTICATION_NAME } from '@module/iam/authentication/domain/authentication.name';
import { CodeMismatchException } from '@module/iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  INVALID_PASSWORD_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  NEW_PASSWORD_REQUIRED_ERROR,
  PASSWORD_VALIDATION_ERROR,
  UNEXPECTED_ERROR_CODE_ERROR,
  USER_NOT_CONFIRMED_ERROR,
} from '@module/iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@module/iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@module/iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { InvalidPasswordException } from '@module/iam/authentication/infrastructure/cognito/exception/invalid-password.exception';
import { InvalidRefreshTokenException } from '@module/iam/authentication/infrastructure/cognito/exception/invalid-refresh-token.exception';
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
  const imageMock = path.resolve(
    __dirname,
    '../../../../test/__mocks__/avatar.jpg',
  );
  const txtMock = path.resolve(__dirname, '../../../../test/__mocks__/txt.txt');

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

  describe('Guards', () => {
    describe('Access Token', () => {
      it('Should allow requests that contain a valid token', async () => {
        const accessToken = createAccessToken({
          sub: '00000000-0000-0000-0000-00000000000X',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user?page[size]=10')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });

      it('Should deny requests that contain an invalid token', async () => {
        const accessToken = createAccessToken({
          sub: 'non-existent-user-id',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('Should respond with an exception if the access token is expired', async () => {
        const expiration = '0ms';
        const accessToken = createAccessToken(
          {
            sub: '00000000-0000-0000-0000-00000000000X',
          },
          { expiresIn: expiration },
        );

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }: { body: IAppErrorResponse }) => {
            expect(body.error.detail).toEqual(
              new TokenExpiredException(TOKEN_EXPIRED_ERROR).message,
            );
          });
      });
    });
  });

  describe('API', () => {
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
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .field('email', signUpDto.email)
          .field('password', signUpDto.password)
          .field('firstName', signUpDto.firstName)
          .field('lastName', signUpDto.lastName)
          .attach('avatar', imageMock)
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
                    avatarUrl: 'test-url',
                    roles: expect.arrayContaining([AppRole.Regular]),
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
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .field('email', signUpDto.email)
          .field('password', signUpDto.password)
          .field('firstName', signUpDto.firstName)
          .field('lastName', signUpDto.lastName)
          .attach('avatar', imageMock)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);

        const externalId = '00000000-0000-0000-0000-000000000002';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .field('email', signUpDto.email)
          .field('password', signUpDto.password)
          .field('firstName', signUpDto.firstName)
          .field('lastName', signUpDto.lastName)
          .attach('avatar', imageMock)
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
                    avatarUrl: 'test-url',
                    roles: expect.arrayContaining([AppRole.Regular]),
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
                    roles: expect.arrayContaining([AppRole.Regular]),
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

      it('Should throw an error when avatar file is invalid', async () => {
        const signUpDto: SignUpDto = {
          email: 'some@account.com',
          password: '$Test123',
          firstName: 'test',
          lastName: 'test',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .field('email', signUpDto.email)
          .field('password', signUpDto.password)
          .field('firstName', signUpDto.firstName)
          .field('lastName', signUpDto.lastName)
          .attach('avatar', txtMock)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body as IAppErrorResponse).toMatchObject({
              error: expect.objectContaining({
                detail: `File "txt.txt" is invalid. Only .${Object.values(ImageFormat).join(', .')} formats are allowed for avatar field.`,
                status: HttpStatus.BAD_REQUEST.toString(),
                source: { pointer: '/api/v1/auth/sign-up' },
                title: 'Wrong format',
              }),
            });
          });
      });

      it('Should validate oversized avatar file', async () => {
        const signUpDto: SignUpDto = {
          email: 'some@account.com',
          password: '$Test123',
          firstName: 'test',
          lastName: 'test',
        };
        const oversizedFile = createLargeMockFile('avatar.jpg', 100);

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .field('email', signUpDto.email)
          .field('password', signUpDto.password)
          .field('firstName', signUpDto.firstName)
          .field('lastName', signUpDto.lastName)
          .attach('avatar', oversizedFile)
          .expect(HttpStatus.PAYLOAD_TOO_LARGE)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              error: expect.objectContaining({
                status: HttpStatus.PAYLOAD_TOO_LARGE.toString(),
                title: 'File too large',
                source: expect.objectContaining({
                  pointer: '/api/v1/auth/sign-up',
                }),
                detail: `File "avatar.jpg" exceeds the maximum size of ${MBTransformer.toMB(MAX_FILE_SIZES[ImageFormat.JPG as keyof typeof MAX_FILE_SIZES]).toFixed(1)} MB.`,
              }),
            });
            expect(body).toEqual(expectedResponse);
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
          .then(({ body }) => {
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
        identityProviderServiceMock.signIn.mockResolvedValueOnce(
          serviceResponse,
        );

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

    describe('POST - /auth/forgot-password', () => {
      const url = '/api/v1/auth/forgot-password';

      it('Should respond with a success message when provided a email to forgot password', async () => {
        identityProviderServiceMock.forgotPassword.mockResolvedValueOnce({
          success: true,
          message: 'Password reset instructions have been sent',
        });
        const forgotPasswordDto: ForgotPasswordDto = {
          email: 'test_admin@email.co',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                data: expect.objectContaining({
                  type: AUTHENTICATION_NAME,
                  attributes: expect.objectContaining({
                    success: true,
                    message: 'Password reset instructions have been sent',
                  }),
                }),
                links: expect.arrayContaining([
                  {
                    href: expect.stringContaining(url),
                    rel: 'self',
                    method: HttpMethod.POST,
                  },
                  {
                    href: expect.stringContaining('/auth/confirm-password'),
                    rel: 'confirm-password',
                    method: HttpMethod.POST,
                  },
                ]),
              }),
            );
          });
      });

      it("Should respond with an EmailNotFoundException when the user doesn't exist", async () => {
        const email = 'fake@email.co';
        const forgotPasswordDto: ForgotPasswordDto = { email };

        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }: { body: IAppErrorResponse }) => {
            expect(body).toEqual({
              error: expect.objectContaining({
                status: HttpStatus.NOT_FOUND.toString(),
                source: expect.objectContaining({
                  pointer: '/api/v1/auth/forgot-password',
                }),
                title: 'Email not found',
                detail: `User with email ${email} was not found`,
              }),
            });
          });
      });

      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const unexpectedError = new UnexpectedErrorCodeException({
          message: 'Unexpected error',
        });

        identityProviderServiceMock.forgotPassword.mockRejectedValueOnce(
          unexpectedError,
        );
        const forgotPasswordDto: ForgotPasswordDto = {
          email: 'test_admin@email.co',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }: { body: IAppErrorResponse }) => {
            const expectedResponse: IAppErrorResponse = {
              error: {
                status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                source: {
                  pointer: '/api/v1/auth/forgot-password',
                },
                title: 'Unexpected error code',
                detail: 'Unexpected error',
              },
            };
            expect(body).toEqual(expectedResponse);
          });
      });
    });

    describe('POST - /auth/confirm-password', () => {
      const url = '/api/v1/auth/confirm-password';
      it('Should respond with a success message when provided a email, password and code', async () => {
        identityProviderServiceMock.confirmPassword.mockResolvedValueOnce({
          success: true,
          message: 'Your password has been correctly updated',
        });
        const confirmPasswordDto: ConfirmPasswordDto = {
          email: 'test_admin@email.co',
          code: '123456',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                data: expect.objectContaining({
                  type: AUTHENTICATION_NAME,
                  attributes: expect.objectContaining({
                    success: true,
                    message: 'Your password has been correctly updated',
                  }),
                }),
                links: expect.arrayContaining([
                  {
                    href: expect.stringContaining(url),
                    rel: 'self',
                    method: HttpMethod.POST,
                  },
                  {
                    href: expect.stringContaining(
                      '/auth/resend-confirmation-code',
                    ),
                    rel: 'resend-confirmation-code',
                    method: HttpMethod.POST,
                  },
                  {
                    href: expect.stringContaining('/auth/sign-in'),
                    rel: 'sign-in',
                    method: HttpMethod.POST,
                  },
                ]),
              }),
            );
          });
      });

      it('Should respond with a CodeMismatchError when the code is invalid', async () => {
        const error = new CodeMismatchException({
          message: CODE_MISMATCH_ERROR,
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: ConfirmPasswordDto = {
          email: 'test_admin@email.co',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.UNAUTHORIZED.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/confirm-password',
                  }),
                  title: 'Code mismatch',
                  detail: CODE_MISMATCH_ERROR,
                }),
              }),
            );
          });
      });

      it('Should respond with an EmailNotFound error when the user does not exist', async () => {
        const email = 'fake@fake.co';

        const confirmPasswordDto: ConfirmPasswordDto = {
          email,
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.NOT_FOUND.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/confirm-password',
                  }),
                  title: 'Email not found',
                  detail: `User with email ${email} was not found`,
                }),
              }),
            );
          });
      });

      it('Should respond with a PasswordValidationException when password is not strong enough', async () => {
        const error = new PasswordValidationException({
          message: PASSWORD_VALIDATION_ERROR,
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: ConfirmPasswordDto = {
          email: 'test_admin@email.co',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.BAD_REQUEST.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/confirm-password',
                  }),
                  title: 'Password validation',
                  detail: PASSWORD_VALIDATION_ERROR,
                }),
              }),
            );
          });
      });

      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const error = new UnexpectedErrorCodeException({
          message: UNEXPECTED_ERROR_CODE_ERROR,
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const forgotPasswordDto: ConfirmPasswordDto = {
          email: 'test_admin@email.co',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/confirm-password',
                  }),
                  title: 'Unexpected error code',
                  detail: UNEXPECTED_ERROR_CODE_ERROR,
                }),
              }),
            );
          });
      });

      it('Should respond with an ExpiredCodeException when the code has expired', async () => {
        const error = new ExpiredCodeException({
          message: EXPIRED_CODE_ERROR,
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: ConfirmPasswordDto = {
          email: 'test_admin@email.co',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.BAD_REQUEST.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/confirm-password',
                  }),
                  title: 'Expired code',
                  detail: EXPIRED_CODE_ERROR,
                }),
              }),
            );
          });
      });
    });

    describe('POST - /auth/resend-confirmation-code', () => {
      const url = '/api/v1/auth/resend-confirmation-code';
      it('Should resend the confirmation code when requested', async () => {
        const successResponse = {
          success: true,
          message: 'A new confirmation code has been sent',
        };
        identityProviderServiceMock.resendConfirmationCode.mockResolvedValueOnce(
          successResponse,
        );
        const confirmPasswordDto: ResendConfirmationCodeDto = {
          email: 'test_admin@email.co',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                data: expect.objectContaining({
                  type: AUTHENTICATION_NAME,
                  attributes: expect.objectContaining({
                    ...successResponse,
                  }),
                }),
                links: expect.arrayContaining([
                  expect.objectContaining({
                    href: expect.stringContaining(url),
                    rel: 'self',
                    method: HttpMethod.POST,
                  }),
                  expect.objectContaining({
                    href: expect.stringContaining('/auth/confirm-password'),
                    rel: 'confirm-password',
                    method: HttpMethod.POST,
                  }),
                ]),
              }),
            );
          });
      });

      it("Should respond with an EmailNotFoundException when the user doesn't exist", async () => {
        const email = 'fake@email.co';
        const forgotPasswordDto: ResendConfirmationCodeDto = { email };

        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.NOT_FOUND.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/resend-confirmation-code',
                  }),
                  title: 'Email not found',
                  detail: `User with email ${email} was not found`,
                }),
              }),
            );
          });
      });

      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        const error = new UnexpectedErrorCodeException({
          message: UNEXPECTED_ERROR_CODE_ERROR,
        });
        identityProviderServiceMock.resendConfirmationCode.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: ResendConfirmationCodeDto = {
          email: 'test_admin@email.co',
        };

        return await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/resend-confirmation-code',
                  }),
                  title: 'Unexpected error code',
                  detail: error.message,
                }),
              }),
            );
          });
      });
    });

    describe('POST - /auth/refresh', () => {
      const url = '/api/v1/auth/refresh';
      it('Should refresh the session when provided a valid refresh token', async () => {
        const successProviderResponse: IRefreshSessionResponse = {
          accessToken: 'accessToken',
        };
        identityProviderServiceMock.refreshSession.mockResolvedValueOnce(
          successProviderResponse,
        );
        const refreshTokenDto: RefreshSessionDto = {
          refreshToken: 'refreshToken',
          email: 'test_admin@email.co',
        };

        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                data: expect.objectContaining({
                  attributes: expect.objectContaining({
                    accessToken: 'accessToken',
                  }),
                }),
              }),
            );
          });
      });

      it('Should respond with an InvalidRefreshTokenError when provided an invalid refresh token', async () => {
        const error = new InvalidRefreshTokenException({
          message: INVALID_REFRESH_TOKEN_ERROR,
        });
        identityProviderServiceMock.refreshSession.mockRejectedValueOnce(error);
        const refreshTokenDto: RefreshSessionDto = {
          refreshToken: 'fakeRefreshToken',
          email: 'test_admin@email.co',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.UNAUTHORIZED.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/refresh',
                  }),
                  title: 'Invalid refresh token',
                  detail: error.message,
                }),
              }),
            );
          });
      });

      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        const email = 'fake@email.co';

        const refreshTokenDto: RefreshSessionDto = {
          refreshToken: 'fakeRefreshToken',
          email,
        };
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.NOT_FOUND.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/refresh',
                  }),
                  title: 'Email not found',
                  detail: `User with email ${email} was not found`,
                }),
              }),
            );
          });
      });

      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        const error = new UnexpectedErrorCodeException({
          message: UNEXPECTED_ERROR_CODE_ERROR,
        });
        identityProviderServiceMock.refreshSession.mockRejectedValueOnce(error);
        const refreshSessionDto: RefreshSessionDto = {
          email: 'test_admin@email.co',
          refreshToken: 'refreshToken',
        };
        return request(app.getHttpServer())
          .post(url)
          .send(refreshSessionDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body).toEqual(
              expect.objectContaining({
                error: expect.objectContaining({
                  status: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
                  source: expect.objectContaining({
                    pointer: '/api/v1/auth/refresh',
                  }),
                  title: 'Unexpected error code',
                  detail: error.message,
                }),
              }),
            );
          });
      });
    });
  });
});
