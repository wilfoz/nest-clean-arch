import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { UserEntity } from '@/users/domain/entities/user.entity';
import { UpdateUserUseCase } from '../../updateuser.usecase';
import { BadRequestError } from '@/shared/application/errors/bad-request-error';

describe('UpdateUserUseCase Unit Tests', () => {
  let sut: UpdateUserUseCase.UseCase;
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
    sut = new UpdateUserUseCase.UseCase(repository);
  });

  it('Should trows error entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', name: 'fake' }),
    ).rejects.toThrow(new NotFoundError('Entity not found'));
  });

  it('Should trows error when name not provided', async () => {
    await expect(() => sut.execute({ id: 'fakeId', name: '' })).rejects.toThrow(
      new BadRequestError('Name not provided'),
    );
  });

  it('Should update a user', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const items = [new UserEntity(userDataBuilder({}))];
    repository.items = items;
    const result = await sut.execute({ id: items[0].id, name: 'new name' });
    expect(spyUpdate).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: items[0].id,
      name: 'new name',
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    });
  });
});
