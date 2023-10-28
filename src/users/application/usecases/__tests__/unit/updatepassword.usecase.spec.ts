import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UpdatePasswordUseCase } from '../../updatepassword.usecase';
import { HashProvider } from '@/shared/application/providers/hash-provider';
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash-provider';
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error';

describe('UpdatePasswordUseCase Unit Tests', () => {
  let sut: UpdatePasswordUseCase.UseCase;
  let repository: UserInMemoryRepository;
  let hashProvider: HashProvider;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    hashProvider = new BcryptjsHashProvider();
    sut = new UpdatePasswordUseCase.UseCase(repository, hashProvider);
  });

  it('Should trows error when entity not found', async () => {
    await expect(
      sut.execute({ id: 'fakeId', password: 'test', oldPassword: 'test' }),
    ).rejects.toThrow(new NotFoundError('Entity not found'));
  });

  it('Should trows error when old password not provided', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    repository.items = [entity];

    await expect(
      sut.execute({ id: entity.id, password: 'new password', oldPassword: '' }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    );
  });

  it('Should trows error when new password not provided', async () => {
    const entity = new UserEntity(userDataBuilder({ password: '1234' }));
    repository.items = [entity];

    await expect(
      sut.execute({ id: entity.id, password: '', oldPassword: '1234' }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    );
  });
  it('Should trows error when old password does not match', async () => {
    const hashPassword = await hashProvider.generateHash('1234');
    const entity = new UserEntity(userDataBuilder({ password: hashPassword }));
    repository.items = [entity];

    await expect(
      sut.execute({ id: entity.id, password: '3444', oldPassword: '12444' }),
    ).rejects.toThrow(new InvalidPasswordError('Password is invalid'));
  });
  it('Should update a password', async () => {
    const hashPassword = await hashProvider.generateHash('1234');
    const spyUpdate = jest.spyOn(repository, 'update');
    const items = [new UserEntity(userDataBuilder({ password: hashPassword }))];
    repository.items = items;

    const result = await sut.execute({
      id: items[0].id,
      password: '4567',
      oldPassword: '1234',
    });

    const checkOldPassword = await hashProvider.compareHash(
      '4567',
      result.password,
    );

    expect(spyUpdate).toHaveBeenCalled();
    expect(checkOldPassword).toBeTruthy();
  });
});
