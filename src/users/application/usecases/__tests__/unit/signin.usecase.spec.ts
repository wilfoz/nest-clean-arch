import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash-provider';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';
import { SignInUseCase } from '../../signin.usecase';
import { UserEntity } from '../../../../domain/entities/user.entity';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credential-error';

describe('SignInUseCase Unit Tests', () => {
  let sut: SignInUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new BcryptjsHashProvider();
    sut = new SignInUseCase.UseCase(repository, hashProvider);
  });

  it('Should authenticate a user', async () => {
    const spyFindByEmail = jest.spyOn(repository, 'findByEmail');
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'email@email.com', password: hashPassword }),
    );
    repository.items = [entity];

    const result = await sut.execute({
      email: entity.email,
      password: '1234',
    });

    expect(spyFindByEmail).toHaveBeenCalled();
    expect(result).toStrictEqual(entity.toJSON());
  });

  it('Should throws error when email not provided', async () => {
    const props = Object.assign(userDataBuilder({}), { email: null });
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should throws error when password not provided', async () => {
    const props = { email: 'test', password: null };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should not be able to authenticate with wrong email', async () => {
    const props = { email: 'test', password: '1234' };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('Should not be able to authenticate with wrong password', async () => {
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(
      userDataBuilder({ email: 'email@email.com', password: hashPassword }),
    );
    repository.items = [entity];

    const props = { email: 'email@email.com', password: 'fake' };
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });
});
