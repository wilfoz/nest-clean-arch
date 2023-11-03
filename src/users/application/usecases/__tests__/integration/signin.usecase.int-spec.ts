import { DatabaseModule } from '@/shared/infrastructure/database/database.module';
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests';
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash-provider';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { SignInUseCase } from '../../signin.usecase';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credential-error';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';

describe('SignInUseCase Integration tests', () => {
  const prismaService = new PrismaClient();
  let sut: SignInUseCase.UseCase;
  let repository: UserPrismaRepository;
  let hashProvider: HashProvider;
  let module: TestingModule;

  beforeAll(async () => {
    setupPrismaTests();
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile();
    repository = new UserPrismaRepository(prismaService as any);
    hashProvider = new BcryptjsHashProvider();
  });

  beforeEach(async () => {
    sut = new SignInUseCase.UseCase(repository, hashProvider);
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should not be able to authenticate with wrong email', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    await expect(() =>
      sut.execute({
        email: entity.email,
        password: '1234',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should not be able to authenticate with wrong password', async () => {
    const password = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'email@email.com', password }),
    );
    const models = await prismaService.user.create({
      data: entity.toJSON(),
    });

    await expect(() =>
      sut.execute({
        email: 'email@email.com',
        password: 'fake',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should throws error when email not provided', async () => {
    await expect(() =>
      sut.execute({
        email: null,
        password: '1234',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('should throws error when password not provided', async () => {
    await expect(() =>
      sut.execute({
        email: 'email@email.com',
        password: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('should authenticate a user', async () => {
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'email@email.com', password: hashPassword }),
    );
    await prismaService.user.create({
      data: entity.toJSON(),
    });

    const output = await sut.execute({
      email: 'email@email.com',
      password: '1234',
    });
    expect(output).toMatchObject(entity.toJSON());
  });
});
