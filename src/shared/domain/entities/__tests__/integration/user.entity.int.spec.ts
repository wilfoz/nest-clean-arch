import { EntityValidationError } from '@/shared/domain/errors/validation-error';
import {
  UserEntity,
  UserProps,
} from '../../../../../users/domain/entities/user.entity';
import { userDataBuilder } from '../../../../../users/domain/testing/helpers/user-data-builder';
describe('UserEntity Integration Tests', () => {
  describe('Constructor method', () => {
    it('should throw an error when creating a user with invalid name', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        name: null,
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        name: '',
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        name: 1 as any,
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        name: 't'.repeat(257),
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);
    });

    it('should throw an error when creating a user with invalid email', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        email: null,
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        email: '',
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        email: 1 as any,
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        email: 't'.repeat(257),
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);
    });

    it('should throw an error when creating a user with invalid password', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        password: null,
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        password: '',
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        password: 't'.repeat(102),
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);
    });

    it('should throw an error when creating a user with invalid createdAt', () => {
      let props: UserProps = {
        ...userDataBuilder({}),
        createdAt: 'null' as any,
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);

      props = {
        ...userDataBuilder({}),
        createdAt: 10 as any,
      };
      expect(() => new UserEntity(props)).toThrowError(EntityValidationError);
    });

    it('should a valid user', () => {
      expect.assertions(0);
      const props: UserProps = {
        ...userDataBuilder({}),
      };
      new UserEntity(props);
    });
  });

  describe('UpdateName method', () => {
    it('should throw an error when updateName a user with invalid name', () => {
      const props = userDataBuilder({});
      const entity = new UserEntity(props);
      expect(() => entity.updateName(null)).toThrowError(EntityValidationError);
      expect(() => entity.updateName('')).toThrowError(EntityValidationError);
      expect(() => entity.updateName('t'.repeat(256))).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.updateName(1 as any)).toThrowError(
        EntityValidationError,
      );
    });

    it('should a valid user', () => {
      expect.assertions(0);
      const props: UserProps = {
        ...userDataBuilder({}),
      };
      const entity = new UserEntity(props);
      entity.updateName('other name');
    });
  });

  describe('UpdatePassword method', () => {
    it('should a invalid user using password field', () => {
      const props = userDataBuilder({});
      const entity = new UserEntity(props);
      expect(() => entity.updatePassword(null)).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.updatePassword('')).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.updatePassword('t'.repeat(102))).toThrowError(
        EntityValidationError,
      );
      expect(() => entity.updateName(1 as any)).toThrowError(
        EntityValidationError,
      );
    });

    it('should a valid user', () => {
      expect.assertions(0);
      const props: UserProps = {
        ...userDataBuilder({}),
      };
      const entity = new UserEntity(props);
      entity.updatePassword('some-password');
    });
  });
});
