import { instanceToPlain } from 'class-transformer';
import { UserPresenter } from '../../user.presenter';

describe('UserPresenter', () => {
  let sut: UserPresenter;
  const createdAt = new Date();
  const props = {
    id: '9354d4ca-2142-4e54-adb4-53ec3c3540d4',
    name: 'test',
    email: 'email@email.com',
    password: '1234',
    createdAt,
  };

  beforeEach(() => {
    sut = new UserPresenter(props);
  });

  describe('Constructor', () => {
    it('should be defined', () => {
      expect(sut.id).toEqual(props.id);
      expect(sut.name).toEqual(props.name);
      expect(sut.email).toEqual(props.email);
      expect(sut.createdAt).toEqual(props.createdAt);
    });
  });

  it('should presenter data', () => {
    const output = instanceToPlain(sut);
    expect(output).toStrictEqual({
      id: '9354d4ca-2142-4e54-adb4-53ec3c3540d4',
      name: 'test',
      email: 'email@email.com',
      createdAt: createdAt.toISOString(),
    });
  });
});
