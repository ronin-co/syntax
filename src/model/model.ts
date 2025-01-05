import type { blob, boolean, date, json, link, number, string } from '@/src/index';
import { throwForbiddenModelDefinition } from '@/src/model/utils/errors';
import {
  serializeFields,
  serializePresets,
  serializeTriggers,
} from '@/src/model/utils/serializers';
import type {
  GetInstructions,
  ModelField,
  ModelIndex,
  ModelTrigger,
  Model as RawModel,
  WithInstruction,
} from '@ronin/compiler';

// This is used to ensure that any object adhering to this interface has both fields.
export interface RoninFields {
  /**
   * The unique identifier for this record.
   */
  id: string;

  /**
   * Contains metadata about the record like creation date, last update, etc.
   */
  ronin: string;
}

export type Primitives =
  | ReturnType<typeof link>
  | ReturnType<typeof string>
  | ReturnType<typeof boolean>
  | ReturnType<typeof number>
  | ReturnType<typeof json>
  | ReturnType<typeof date>
  | ReturnType<typeof blob>
  | NestedFields;

export interface NestedFields {
  [key: string]: Primitives;
}

export interface Model<Fields>
  extends Omit<RawModel, 'fields' | 'indexes' | 'triggers' | 'presets'> {
  /**
   * The fields that make up this model's schema.
   */
  fields?: Fields;

  /**
   * Predefined query instructions that can be reused across multiple different queries.
   */
  presets?: Record<string, GetInstructions | WithInstruction>;

  /**
   * Database indexes to optimize query performance.
   */
  indexes?: Array<ModelIndex<Array<ModelField & { slug: keyof Fields }>>>;

  /**
   * Queries that run automatically in response to other queries.
   */
  triggers?: Array<ModelTrigger<Array<ModelField & { slug: keyof Fields }>>>;
}

export interface FieldGeneric {
  /**
   * The visual display name of the field.
   */
  name?: string;
}

export interface SerializedField<T> {
  /**
   * Whether the field is required.
   */
  required: boolean;

  /**
   * The value that the field should provide in the case of a missing value.
   */
  defaultValue?: T | null;

  /**
   * Whether the field's value should be unique across all records of the model.
   */
  unique: boolean;

  /**
   * Whether the field's value should be incremented automatically with each new record.
   * Only available for number fields.
   */
  increment: T extends number ? boolean : never;
}

interface LinkField {
  /**
   * Defines referential integrity behavior when linked records are modified.
   */
  actions?: {
    /**
     * Action to take when the referenced record is deleted.
     */
    onDelete?: 'cascade' | 'restrict' | 'set null' | 'no action';

    /**
     * Action to take when the referenced record is updated.
     */
    onUpdate?: 'cascade' | 'restrict' | 'set null' | 'no action';
  };

  /**
   * The model that this field links to.
   */
  model: RoninFields | { slug: string };
}
export interface SerializedLinkField
  extends Omit<Partial<SerializedField<string>>, 'increment'>,
    LinkField {}

// This type maps the fields of a model to their types.
type FieldsToTypes<F> = F extends Record<string, Primitives>
  ? {
      [K in keyof F]: F[K] extends Record<string, Primitives>
        ? FieldsToTypes<F[K]>
        : F[K]['type'] extends 'string'
          ? string
          : F[K]['type'] extends 'number'
            ? number
            : F[K]['type'] extends 'boolean'
              ? boolean
              : F[K]['type'] extends 'link'
                ? string
                : F[K]['type'] extends 'json'
                  ? object
                  : F[K]['type'] extends 'blob'
                    ? Blob
                    : F[K]['type'] extends 'date'
                      ? Date
                      : never;
    }
  : RoninFields;

// Forbidden field keys.
type ForbiddenKeys =
  | 'id'
  | 'ronin'
  | 'ronin.updatedAt'
  | 'ronin.createdBy'
  | 'ronin.updatedBy'
  | 'ronin.createdAt'
  | 'ronin.locked';

// Exclude forbidden keys.
export type RecordWithoutForbiddenKeys<V> = {
  [K in Exclude<string, ForbiddenKeys>]: V;
} & {
  [K in ForbiddenKeys]?: never;
};

// This type expands to show the properties and their types rather than `FieldsToTypes`.
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * Generates a model definition and adds default fields to the provided model.
 *
 * @example
 * ```ts
 * const Account = model({
 *   slug: 'account',
 *   pluralSlug: 'accounts',
 *   fields: {
 *     name: string()
 *   },
 * });
 * ```
 *
 * @template T - A generic type representing the model structure, which contains a slug
 * and fields.
 * @param model - An object containing the slug and fields of the model.
 *
 * @returns The generated model definition.
 */
export const model = <Fields extends RecordWithoutForbiddenKeys<Primitives>>(
  model: Model<Fields>,
): Expand<FieldsToTypes<Fields>> & Expand<RoninFields> => {
  const {
    slug,
    pluralSlug,
    name,
    pluralName,
    identifiers,
    idPrefix,
    fields,
    indexes,
    presets,
    triggers,
  } = model;

  throwForbiddenModelDefinition(model);

  return {
    slug,
    pluralSlug,
    name,
    pluralName,
    identifiers,
    idPrefix,
    fields: serializeFields(fields),
    presets: serializePresets(presets),
    triggers: serializeTriggers(triggers),
    indexes,
  } as unknown as Expand<FieldsToTypes<Fields>> & Expand<RoninFields>;
};
