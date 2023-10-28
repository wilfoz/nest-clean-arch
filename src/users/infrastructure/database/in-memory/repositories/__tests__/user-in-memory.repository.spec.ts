import { UserEntity } from '@/users/domain/entities/user.entity';
import { UserInMemoryRepository } from '../user-in-memory.repository';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';
import { NotFoundError } from '@/shared/domain/errors/not-found-error';
import { ConflictError } from '@/shared/domain/errors/conflict-error';

describe('UserInMemoryRepository Unit Tests', () => {
  let sut: UserInMemoryRepository;

  beforeEach(() => {
    sut = new UserInMemoryRepository();
  });

  it('should throw error when not found - findByEmail method', async () => {
    await expect(sut.findByEmail('a@a.com')).rejects.toThrow(
      new NotFoundError('Entity not found using email a@a.com'),
    );
  });

  it('should find a entity by email - findByEmail method', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    sut.insert(entity);
    const result = await sut.findByEmail(entity.email);
    expect(entity.toJSON()).toStrictEqual(result.toJSON());
  });

  it('should throw error when not found - emailExists method', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    sut.insert(entity);
    await expect(sut.emailExists(entity.email)).rejects.toThrow(
      new ConflictError('Email Address already used'),
    );
  });

  it('should find a email - emailExists method', async () => {
    expect.assertions(0);
    await sut.emailExists('a@a.com');
  });
  it('should no filter items when filter object is null', async () => {
    const entity = new UserEntity(userDataBuilder({}));
    sut.insert(entity);
    const result = await sut.findAll();
    const spyFilter = jest.spyOn(result, 'filter');
    const itemsFiltered = await sut['applyFilter'](result, null);
    expect(spyFilter).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(result);
  });

  it('should filter name field using filter params', async () => {
    const items = [
      new UserEntity(userDataBuilder({ name: 'Test' })),
      new UserEntity(userDataBuilder({ name: 'TEST' })),
      new UserEntity(userDataBuilder({ name: 'fake' })),
    ];
    const spyFilter = jest.spyOn(items, 'filter');
    const itemsFiltered = await sut['applyFilter'](items, 'test');
    expect(spyFilter).toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should sort by createdAt when sort param is null', async () => {
    // jest
    //   .useFakeTimers({ advanceTimers: true })
    //   .setSystemTime(new Date('2020-01-01'));

    const createAt = new Date();
    const items = [
      new UserEntity(userDataBuilder({ name: 'Test', createdAt: createAt })),
      new UserEntity(
        userDataBuilder({
          name: 'TEST',
          createdAt: new Date(createAt.getTime() + 1),
        }),
      ),
      new UserEntity(
        userDataBuilder({
          name: 'fake',
          createdAt: new Date(createAt.getTime() + 2),
        }),
      ),
    ];
    const itemsSorted = await sut['applySort'](items, null, null);
    expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
  });

  it('should sort by name', async () => {
    const items = [
      new UserEntity(userDataBuilder({ name: 'b' })),
      new UserEntity(userDataBuilder({ name: 'a' })),
      new UserEntity(userDataBuilder({ name: 'c' })),
    ];
    const itemsSorted = await sut['applySort'](items, 'name', 'asc');
    expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);
  });
});
