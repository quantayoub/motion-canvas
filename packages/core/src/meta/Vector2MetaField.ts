import {PossibleVector2, Vector2} from '../types';
import {MetaField} from './MetaField';
import {MetaOption} from './MetaOption';

/**
 * Represents a two-dimensional vector stored in a meta file.
 */
export class Vector2MetaField extends MetaField<PossibleVector2, Vector2> {
  public readonly type = Vector2.symbol;
  protected presets: MetaOption<Vector2>[] = [];

  public override parse(value: PossibleVector2): Vector2 {
    return new Vector2(value);
  }

  public override serialize(): PossibleVector2 {
    return this.value.current.serialize();
  }

  public getPresets() {
    return this.presets;
  }

  public setPresets(options: MetaOption<Vector2>[]): this {
    this.presets = options;
    return this;
  }
}
