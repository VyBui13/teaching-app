export abstract class Entity<T> {
  readonly id: string;
  protected props: T;

  constructor(props: T, id?: string) {
    this.id = id || `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.props = props;
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object === undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    return this.id === object.id;
  }
}
