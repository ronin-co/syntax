import type { FieldGeneric, SerializedField } from '@/src/model/model';

interface StringAttributes {
  displayAs?: 'single-line' | 'multi-line' | 'secret';
}

/**
 * Creates a string field definition returning an object that includes the field type
 * ("string") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "string" with the specified or default attributes.
 */
export const string = (
  attributes: Omit<Partial<SerializedField<string>>, 'increment'> &
    FieldGeneric &
    StringAttributes = {},
) => {
  const { name, displayAs, ...rest } = attributes;

  return {
    name,
    displayAs: displayAs ?? 'single-line',
    type: 'string' as const,
    ...rest,
  };
};
