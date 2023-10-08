import { faker } from '@faker-js/faker';
import { UserEntity, UserProps } from '../../user.entity';
import { userDataBuilder } from '@/users/domain/testing/helpers/user-data-builder';

describe('UserEntity Unit Tests', () => {
  let props: UserProps;
  let sut: UserEntity;

  beforeEach(() => {
    UserEntity.validate = jest.fn();
    props = userDataBuilder({});
    sut = new UserEntity(props);
  });

  it('Constructor method', () => {
    expect(UserEntity.validate).toHaveBeenCalled();
    expect(sut.props.name).toEqual(props.name);
    expect(sut.props.email).toEqual(props.email);
    expect(sut.props.password).toEqual(props.password);
    expect(sut.props.createdAt).toBeInstanceOf(Date);
  });

  it('Getter of name fields', () => {
    expect(sut.props.name).toBeDefined();
    expect(sut.props.name).toEqual(props.name);
    expect(typeof sut.props.name).toBe('string');
  });

  it('Setter of name fields', () => {
    sut['name'] = 'other name';

    expect(sut.props.name).toEqual('other name');
    expect(typeof sut.props.name).toBe('string');
  });

  it('Getter of email fields', () => {
    expect(sut.props.email).toBeDefined();
    expect(sut.props.email).toEqual(props.email);
    expect(typeof sut.props.email).toBe('string');
  });

  it('Getter of password fields', () => {
    expect(sut.props.password).toBeDefined();
    expect(sut.props.password).toEqual(props.password);
    expect(typeof sut.props.password).toBe('string');
  });

  it('Setter of name fields', () => {
    sut['password'] = 'other password';

    expect(sut.props.password).toEqual('other password');
    expect(typeof sut.props.password).toBe('string');
  });

  it('Getter of createdAt fields', () => {
    expect(sut.props.createdAt).toBeDefined();
    expect(sut.props.createdAt).toBeInstanceOf(Date);
  });

  it('should update a user', () => {
    sut.updateName('other name');
    expect(UserEntity.validate).toHaveBeenCalled();
    expect(sut.props.name).toEqual('other name');
  });

  it('should update the password field', () => {
    sut.updatePassword('other password');
    expect(UserEntity.validate).toHaveBeenCalled();
    expect(sut.props.password).toEqual('other password');
  });
});
