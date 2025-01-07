import type { SerializedField } from '@/src/model';

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

/**
 * Creates a link field definition returning an object that includes the field type
 * ("link") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "link" with the specified or default attributes.
 */
export const link = (attributes: SerializedField<'link'> = {}) => {
  const { name, target, actions, ...rest } = attributes;

  if (!target) throw new Error('A model is required for a link field');

  return {
    name,
    target,
    actions,
    type: 'link' as const,
    ...rest,
  };
};

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

/**
 * Creates a blob field definition returning an object that includes the field type
 * ("blob") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "blob" with the specified or default attributes.
 */
export const blob = (attributes: SerializedField<'blob'> = {}) => {
  const { name, ...rest } = attributes;

  return {
    name,
    type: 'blob' as const,
    ...rest,
  };
};
