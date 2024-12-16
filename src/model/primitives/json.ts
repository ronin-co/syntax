import type { FieldGeneric, SerializedField } from '@/src/model/model';

interface JsonAttributes {
  displayAs?: 'rich-text';
}

/**
 * Creates a JSON field definition returning an object that includes the field type
 * ("json") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "json" with the specified or default attributes.
 */
export const json = (
  attributes: Omit<Partial<SerializedField<string | object>>, 'increment'> &
    FieldGeneric &
    JsonAttributes = {},
) => {
  const { name, displayAs, ...rest } = attributes;

  return {
    name,
    displayAs,
    type: 'json' as const,
    ...rest,
  };
};
