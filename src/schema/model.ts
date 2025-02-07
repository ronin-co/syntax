import { getSyntaxProxy } from '@/src/queries';
import type {
  Chain,
  FieldOutput,
  SyntaxField,
  blob,
  boolean,
  date,
  json,
  link,
  number,
  string,
} from '@/src/schema';
import type {
  GetInstructions,
  ModelField,
  ModelIndex,
  ModelTrigger,
  Model as RawModel,
  StoredObject,
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
  | NestedFieldsPrimitives
  | Chain<
      FieldOutput<'string' | 'number' | 'boolean' | 'link' | 'json' | 'date' | 'blob'>,
      | 'name'
      | 'displayAs'
      | 'unique'
      | 'required'
      | 'defaultValue'
      | 'computedAs'
      | 'check'
    >;

export type PrimitivesItem =
  | SyntaxField<'link'>
  | SyntaxField<'string'>
  | SyntaxField<'boolean'>
  | SyntaxField<'number'>
  | SyntaxField<'json'>
  | SyntaxField<'date'>
  | SyntaxField<'blob'>
  | NestedFieldsPrimitivesItem;

export interface NestedFieldsPrimitives {
  [key: string]: Primitives;
}

export interface NestedFieldsPrimitivesItem {
  [key: string]: PrimitivesItem;
}

type FieldReferences<Fields> = Record<keyof Fields, unknown> & {
  id: string;
  ronin: {
    updatedAt: Date;
    updatedBy: string;
    createdAt: Date;
    createdBy: string;
    locked: boolean;
  };
};

export interface Model<Fields = RecordWithoutForbiddenKeys<Primitives>>
  extends Omit<RawModel, 'fields' | 'indexes' | 'triggers' | 'presets'> {
  /**
   * The fields that make up this model.
   */
  fields?: Fields;

  /**
   * Database indexes to optimize query performance.
   */
  indexes?: Array<ModelIndex<Array<ModelField & { slug: keyof Fields }>>>;

  /**
   * Queries that run automatically in response to other queries.
   */
  triggers?: Array<ModelTrigger<Array<ModelField & { slug: keyof Fields }>>>;

  /**
   * Predefined query instructions that can be reused across multiple different queries.
   */
  presets?:
    | Record<string, GetInstructions | WithInstruction>
    | ((
        fields: FieldReferences<Fields>,
      ) => Record<string, GetInstructions | WithInstruction>);
}

// This type maps the fields of a model to their types.
type FieldToTypeMap = {
  blob: StoredObject;
  boolean: boolean;
  date: Date;
  json: object;
  link: string;
  number: number;
  string: string;
};
type FieldsToTypes<F> = F extends Record<string, Primitives>
  ? {
      [K in keyof F]: F[K] extends Record<string, Primitives>
        ? FieldsToTypes<F[K]>
        : F[K]['type'] extends keyof FieldToTypeMap
          ? F[K]['required'] extends true
            ? FieldToTypeMap[F[K]['type']]
            : FieldToTypeMap[F[K]['type']] | null
          : object;
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
/*
export const model = <Fields extends RecordWithoutForbiddenKeys<Primitives>>(
  model: Model<Fields>,
): Expand<RoninFields & FieldsToTypes<Fields>> => {
  const newModel = { ...model };

  if (newModel.fields) {
    newModel.fields = serializeFields(
      newModel.fields as RecordWithoutForbiddenKeys<PrimitivesItem>,
    ) as unknown as typeof newModel.fields;
  }


  if (newModel.triggers) {
    newModel.triggers = serializeTriggers(
      newModel.triggers,
    ) as unknown as typeof newModel.triggers;
  }

  if (newModel.presets) {
    newModel.presets = serializePresets(
      newModel.presets,
    ) as unknown as typeof newModel.presets;
  }

  return newModel as unknown as Expand<RoninFields & FieldsToTypes<Fields>>;
};
*/

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
): Expand<RoninFields & FieldsToTypes<Fields>> => {
  const newModel = { ...model };

  if (newModel.fields) {
    newModel.fields = Object.entries(newModel.fields).map(([slug, rest]) => ({
      slug,
      ...(rest.toJSON ? rest.toJSON() : rest),
    }));
  }

  if (newModel.presets) {
    newModel.presets = Object.entries(newModel.presets).map(([slug, instructions]) => ({
      slug,
      instructions,
    }));
  }

  const finalModel = getSyntaxProxy()(newModel) as unknown as Expand<
    RoninFields & FieldsToTypes<Fields>
  >;

  return finalModel.toJSON();
};
