import type { SerializedField } from '@/src/model/model';

/**
 * Creates a boolean field definition returning an object that includes the field type
 * ("boolean") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "boolean" with the specified or default attributes.
 */
export const boolean = (attributes: SerializedField<'boolean'> = {}) => {
  const { name, ...rest } = attributes;

  return {
    name,
    type: 'boolean' as const,
    ...rest,
  };
};
