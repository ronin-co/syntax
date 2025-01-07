import type { SerializedField } from '@/src/schema/model';
import type { ModelField } from '@ronin/compiler';

/**
 * Creates a primitive field definition returning an object that includes the field type
 * and attributes.
 *
 * @param type - The field type.
 *
 * @returns A field of the provided type with the specified attributes.
 */
const primitive = <T extends ModelField['type']>(type: T) => {
  return (attributes: SerializedField<T> = {}) => ({ type, ...attributes });
};

/**
 * Creates a string field definition returning an object that includes the field type
 * ("string") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "string" with the specified attributes.
 */
export const string = primitive('string');

/**
 * Creates a number field definition returning an object that includes the field type
 * ("number") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "number" with the specified attributes.
 */
export const number = primitive('number');

/**
 * Creates a link field definition returning an object that includes the field type
 * ("link") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "link" with the specified attributes.
 */
export const link = primitive('link');

/**
 * Creates a JSON field definition returning an object that includes the field type
 * ("json") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "json" with the specified attributes.
 */
export const json = primitive('json');

/**
 * Creates a date field definition returning an object that includes the field type
 * ("date") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "date" with the specified attributes.
 */
export const date = primitive('date');

/**
 * Creates a boolean field definition returning an object that includes the field type
 * ("boolean") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "boolean" with the specified attributes.
 */
export const boolean = primitive('boolean');

/**
 * Creates a blob field definition returning an object that includes the field type
 * ("blob") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "blob" with the specified attributes.
 */
export const blob = primitive('blob');
