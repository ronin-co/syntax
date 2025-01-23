import { type SyntaxItem, getSyntaxProxy } from '@/src/queries';
import type { ModelField } from '@ronin/compiler';

/** A utility type that maps an attribute's type to a function signature. */
type AttributeSignature<T, Attribute> = T extends boolean
  ? () => any
  : Attribute extends keyof Omit<ModelFieldExpressions<T>, 'type' | 'slug'>
    ? ModelFieldExpressions<T>[Attribute]
    : never;

/**
 * Represents a chain of field attributes in the form of a function chain.
 *
 * - `Attrs`: The interface describing your attributes (e.g., { required: boolean; }).
 * - `Used`: A union of the keys already used in the chain.
 *
 * For each attribute key `K` not in `Used`, create a method using the signature derived
 * from that attribute's type. Calling it returns a new `Chain` marking `K` as used.
 */
export type Chain<Attrs, Used extends keyof Attrs = never> = {
  // 1) Chainable methods for all keys that are not in `Used` or `type`
  [K in Exclude<keyof Attrs, Used | 'type'>]: (
    ...args: Array<AttributeSignature<TypeToTSType<Attrs['type']>, K>>
  ) => Chain<Attrs, Used | K>;
  // 2) If `type` is defined in `Attrs`, add it as a read-only property
  // biome-ignore lint/complexity/noBannedTypes: This is a valid use case.
} & ('type' extends keyof Attrs ? { readonly type: Attrs['type'] } : {});

type TypeToTSType<Type> = Type extends 'string'
  ? string
  : Type extends 'number'
    ? number
    : Type extends 'boolean'
      ? boolean
      : Type extends 'blob'
        ? Blob
        : never;

type FieldInput<Type> = Partial<
  Omit<
    Extract<ModelField & ModelFieldExpressions<TypeToTSType<Type>>, { type: Type }>,
    'slug' | 'type'
  >
>;

export type FieldOutput<Type extends ModelField['type']> = Omit<
  Extract<ModelField, { type: Type }>,
  'slug'
>;

export type ModelFieldExpressions<Type> = {
  check?: (fields: Record<string, Type>) => Type;
  computedAs?: (fields: Record<string, Type>) => {
    value: () => Type;
    kind: 'VIRTUAL' | 'STORED';
  };
  defaultValue?: () => Type | Type;
};

export type SyntaxField<Type extends ModelField['type']> = SyntaxItem<FieldOutput<Type>>;

/**
 * Creates a primitive field definition returning an object that includes the field type
 * and attributes.
 *
 * @param type - The field type.
 *
 * @returns A field of the provided type with the specified attributes.
 */
const primitive = <T extends ModelField['type']>(type: T) => {
  return (initialAttributes: FieldInput<T> = {}) => {
    return getSyntaxProxy({ propertyValue: true })({
      ...initialAttributes,
      type,
    }) as Chain<FieldOutput<T>>;
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
