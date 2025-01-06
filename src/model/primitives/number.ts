import type { SerializedField } from '@/src/model/model';

/**
 * Creates a number field definition returning an object that includes the field type
 * ("number") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "number" with the specified or default attributes.
 */
export const number = (attributes: SerializedField<'number'> = {}) => {
  const { name, ...rest } = attributes;

  return {
    name,
    type: 'number' as const,
    ...rest,
  };
};
