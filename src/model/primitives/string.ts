import type { SerializedField } from '@/src/model/model';

/**
 * Creates a string field definition returning an object that includes the field type
 * ("string") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "string" with the specified or default attributes.
 */
export const string = (attributes: SerializedField<'string'> = {}) => {
  const { name, displayAs, ...rest } = attributes;

  return {
    name,
    displayAs: displayAs ?? 'single-line',
    type: 'string' as const,
    ...rest,
  };
};
