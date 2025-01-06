import type { SerializedField } from '@/src/model/model';

/**
 * Creates a JSON field definition returning an object that includes the field type
 * ("json") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "json" with the specified or default attributes.
 */
export const json = (attributes: SerializedField<'json'> = {}) => {
  const { name, displayAs, ...rest } = attributes;

  return {
    name,
    displayAs,
    type: 'json' as const,
    ...rest,
  };
};
