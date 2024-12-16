import type { FieldGeneric, SerializedField } from '@/src/model/model';

/**
 * Creates a blob field definition returning an object that includes the field type
 * ("blob") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "blob" with the specified or default attributes.
 */
export const blob = (
  attributes: Omit<Partial<SerializedField<string>>, 'increment'> & FieldGeneric = {},
) => {
  const { name, ...rest } = attributes;

  return {
    name,
    type: 'blob' as const,
    ...rest,
  };
};
