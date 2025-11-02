import {Vector2, Vector2MetaField} from '@motion-canvas/core';
import {useSubscribableValue} from '../../hooks';
import {NumberInput, Select} from '../controls';
import {MetaFieldGroup} from './MetaFieldGroup';

export interface Vector2MetaFieldViewProps {
  field: Vector2MetaField;
}

function vector2Equals(a: Vector2, b: Vector2): boolean {
  return a.x === b.x && a.y === b.y;
}

export function Vector2MetaFieldView({field}: Vector2MetaFieldViewProps) {
  const value = useSubscribableValue(field.onChanged);
  const presets = field.getPresets();

  // Find matching preset if any (0-based index, with -1 for no match)
  const matchingPresetIndex = presets.findIndex(preset =>
    vector2Equals(value, preset.value),
  );

  // Create options array with "Custom" option at index 0, then presets
  // The Select component uses findIndex to match values, so we use a string identifier
  // that can be uniquely matched
  const allOptions = [
    {value: 'custom', text: 'Custom'},
    ...presets.map((preset, index) => ({
      value: `preset-${index}`,
      text: preset.text,
    })),
  ];

  // Current selected value: 'custom' for custom, or preset identifier for presets
  const selectedValue =
    matchingPresetIndex >= 0 ? `preset-${matchingPresetIndex}` : 'custom';

  return (
    <MetaFieldGroup field={field}>
      {presets.length > 0 && (
        <Select
          options={allOptions}
          value={selectedValue}
          onChange={newValue => {
            if (
              typeof newValue === 'string' &&
              newValue.startsWith('preset-')
            ) {
              const presetIndex = parseInt(newValue.replace('preset-', ''), 10);
              if (presetIndex >= 0 && presetIndex < presets.length) {
                field.set(presets[presetIndex].value);
              }
            }
          }}
        />
      )}
      <NumberInput value={value.x} onChange={x => field.set([x, value.y])} />
      <NumberInput value={value.y} onChange={y => field.set([value.x, y])} />
    </MetaFieldGroup>
  );
}
