import { v4 as uuidv4 } from 'uuid';

export abstract class Entity<Props = any> {
  public readonly _id: string;
  public readonly _props: Props;

  constructor(props: Props, id?: string) {
    this._props = props;
    this._id = id ?? uuidv4();
  }

  get id() {
    return this._id;
  }

  toJSON(): Required<{ id: string } & Props> {
    return {
      id: this._id,
      ...this._props,
    } as Required<{ id: string } & Props>;
  }
}
