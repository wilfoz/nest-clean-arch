import { validate as uuidValidate } from 'uuid';
import { Entity } from '../../entity';

type StubProps = {
  prop1: string;
  prop2: number;
};

class StupEntity extends Entity<StubProps> { }
describe('Entity Unit Tests', () => {
  it('should set props and id', () => {
    const props = { prop1: 'value', prop2: 1 };
    const entity = new StupEntity(props);

    expect(entity._props).toStrictEqual(props);
    expect(entity.id).not.toBeNull();
    expect(uuidValidate(entity.id)).toBeTruthy();
  });

  it('should accept a valid uuid', () => {
    const props = { prop1: 'value', prop2: 1 };
    const id = 'a95fbd18-2e65-4c09-a0bc-2cd088a386d3';
    const entity = new StupEntity(props, id);

    expect(uuidValidate(entity.id)).toBeTruthy();
    expect(entity.id).toBe(id);
  });

  it('should convert a entity to a JSON', () => {
    const props = { prop1: 'value', prop2: 1 };
    const id = 'a95fbd18-2e65-4c09-a0bc-2cd088a386d3';
    const entity = new StupEntity(props, id);

    expect(entity.toJSON()).toStrictEqual({
      id,
      ...props,
    });
  });
});
