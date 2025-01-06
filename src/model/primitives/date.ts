import type { SerializedField } from '@/src/model/model';

/**
 * Creates a date field definition returning an object that includes the field type
 * ("date") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "date" with the specified or default attributes.
 */
export const date = (attributes: SerializedField<'date'> = {}) => {
  const { name, ...rest } = attributes;

  return {
    name,
    type: 'date' as const,
    ...rest,
  };
};
