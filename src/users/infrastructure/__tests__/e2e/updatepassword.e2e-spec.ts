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
import { UpdatePasswordDto } from '../../dto/update-password.dto';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash-provider';

describe('UsersController E2E Tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let repository: UserRepository.Repository;
  let updatePasswordDto: UpdatePasswordDto;
  const prismaService = new PrismaClient();
  let hashProvider: HashProvider;
  let entity: UserEntity;

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
    updatePasswordDto = {
      password: 'newPassword',
      oldPassword: 'oldPassword',
    };
    await prismaService.user.deleteMany();
    const hashPassword = await hashProvider.generateHash('oldPassword');
    entity = new UserEntity(userDataBuilder({ password: hashPassword }));
    repository.insert(entity);
  });

  describe('PATCH/users', () => {
    it('should update a password', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(200);
      expect(Object.keys(res.body)).toStrictEqual(['data']);

      const user = await repository.findById(res.body.data.id);
      console.log(user);
      const checkPassword = await hashProvider.compareHash(
        'newPassword',
        user.password,
      );
      expect(checkPassword).toBeTruthy();
    });

    it('should return error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/fakeId')
        .send({})
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
        'oldPassword should not be empty',
        'oldPassword must be a string',
      ]);
    });

    it('should return error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/fakeId')
        .send(updatePasswordDto)
        .expect(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toEqual('UserModel not found ID fakeId');
    });

    it('should return error with 422 code when the password field is invalid', async () => {
      delete updatePasswordDto.password;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should return error with 422 code when the oldPassword field is invalid', async () => {
      delete updatePasswordDto.oldPassword;
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422);
      expect(res.body.error).toBe('Unprocessable Entity');
      expect(res.body.message).toEqual([
        'oldPassword should not be empty',
        'oldPassword must be a string',
      ]);
    });

    it('should return error with 422 code when password no match', async () => {
      updatePasswordDto.oldPassword = 'fake';
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .send(updatePasswordDto)
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Password is invalid',
        });
    });
  });
});
