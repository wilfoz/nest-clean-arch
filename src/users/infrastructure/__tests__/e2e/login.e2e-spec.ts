import { UserRepository } from '@/users/domain/repositories/user.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module';
import { UsersModule } from '../../users.module';
import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import request from 'supertest';
import { applyGlobalConfig } from '@/global-config';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { SignInDto } from '../../dto/signin.dto';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash-provider';

describe('UsersController E2E Tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let signInDto: SignInDto;
  let hashProvider: HashProvider;
  const prismaService = new PrismaClient();

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile();
    app = module.createNestApplication();
    applyGlobalConfig(app);
    await app.init();
    repository = module.get<UserRepository.Repository>('UserRepository');
    hashProvider = new BcryptjsHashProvider();
  });

  beforeEach(async () => {
    signInDto = {
      email: 'email@email.com',
      password: 'TestPassword123',
    };
    const hashPassword = await hashProvider.generateHash('TestPassword123');
    await prismaService.user.deleteMany();
  });

  describe('POST/users/login', () => {
    it('should authenticate a user', async () => {
      const hashPassword = await hashProvider.generateHash('TestPassword123');
      const entity = new UserEntity({
        ...userDataBuilder({}),
        email: signInDto.email,
        password: hashPassword,
      });
      await repository.insert(entity);
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signInDto)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['accessToken']);
      expect(typeof res.body.accessToken).toEqual('string');
    });

    it('should return error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({})
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return error with 422 code when the email field is invalid', async () => {
      delete signInDto.email;
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signInDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
      ]);
    });

    it('should return error with 422 code when the password field is invalid', async () => {
      delete signInDto.password;
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signInDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return error with 404 code when email not found', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({ email: 'nof@email.com', password: 'fake' })
        .expect(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toEqual(
        'UserModel not found email nof@email.com',
      );
    });
  });
});
