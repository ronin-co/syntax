import { getSyntaxProxy } from '@/src/queries';
import type { SerializedField } from '@/src/schema/model';
import type { ModelField } from '@ronin/compiler';

/** A utility type that maps an attribute's type to a function signature. */
type AttributeSignature<T> = T extends boolean
  ? () => any
  : T extends boolean
    ? never
    : (value: string) => any;

/**
 * Represents a chain of field attributes in the form of a function chain.
 *
 * - `Attrs`: The interface describing your attributes (e.g., { required: boolean; }).
 * - `Used`: A union of the keys already used in the chain.
 *
 * For each attribute key `K` not in `Used`, create a method using the signature derived
 * from that attribute's type. Calling it returns a new `Chain` marking `K` as used.
 */
type Chain<Attrs, Used extends keyof Attrs = never> = {
  [K in Exclude<
    keyof Attrs,
    Used
  >]: // Convert the attribute type into a function signature and produce the next chain
  // stage with `K` now included in `Used`.
  (...args: Parameters<AttributeSignature<Attrs[K]>>) => Chain<Attrs, Used | K>;
};

export type PrimitiveField<T extends ModelField['type']> = Omit<
  Extract<ModelField, { type: T }>,
  'slug'
>;

/**
 * Creates a primitive field definition returning an object that includes the field type
 * and attributes.
 *
 * @param type - The field type.
 *
 * @returns A field of the provided type with the specified attributes.
 */
const primitive = <T extends ModelField['type']>(type: T) => {
  return (initialAttributes: SerializedField<T> = {}) => {
    return getSyntaxProxy()({ ...initialAttributes, type }) as Chain<SerializedField<T>>;
  };
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
