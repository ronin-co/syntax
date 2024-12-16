import type { FieldGeneric, SerializedLinkField } from '@/src/model/model';

/**
 * Creates a link field definition returning an object that includes the field type
 * ("link") and attributes.
 *
 * @param attributes - Optional field attributes.
 *
 * @returns A field of type "link" with the specified or default attributes.
 */
export const link = (attributes: SerializedLinkField & FieldGeneric) => {
  const { name, model, actions, ...rest } = attributes;

  if (!model) throw new Error('A model is required for a link field');

  return {
    name,
    model,
    actions,
    type: 'link' as const,
    ...rest,
  };
};
