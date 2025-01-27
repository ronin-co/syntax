import { type SyntaxItem, getBatchProxy } from '@/src/queries';
import type { PrimitivesItem } from '@/src/schema/model';
import type {
  GetInstructions,
  ModelField,
  ModelTrigger,
  Query,
  WithInstruction,
} from '@ronin/compiler';

/**
 * Serialize fields from `Record<string, Primitives>` to `Model<Fields>`.
 *
 * @param fields - The fields to serialize.
 *
 * @returns The serialized fields.
 */
export const serializeFields = (fields: Record<string, PrimitivesItem>) => {
  if (Array.isArray(fields)) return fields;

  return Object.entries(fields).flatMap(
    ([key, initialValue]): Array<ModelField> | ModelField => {
      let value = initialValue?.structure;

      if (typeof value === 'undefined') {
        value = initialValue as Record<string, PrimitivesItem>;
        const result: typeof value = {};

        for (const k of Object.keys(value)) {
          result[`${key}.${k}`] = value[k];
        }

        return serializeFields(result) || [];
      }

      return {
        slug: key,
        ...value,
      };
    },
  );
};

/**
 * Serialize fields from `Record<string, Primitives>` to `Model<Fields>`.
 *
 * @param fields - The fields to serialize.
 *
 * @returns The serialized fields.
 */
export const serializePresets = (
  presets: Record<string, WithInstruction | GetInstructions>,
) => {
  return Object.entries(presets).map(([key, value]) => {
    return {
      slug: key,
      instructions: value,
    };
  });
};

/**
 * Serialize model triggers into a format that can be processed by the compiler.
 *
 * @param triggers - An array of model triggers to serialize. Each trigger defines when
 * and how to execute certain effects based on database operations.
 *
 * @returns The serialized triggers array, or undefined if no triggers were provided.
 */
export const serializeTriggers = (triggers: Array<ModelTrigger<Array<ModelField>>>) => {
  return triggers.map((trigger) => {
    const effectQueries = trigger.effects as unknown as () => Array<SyntaxItem<Query>>;

    return {
      ...trigger,
      effects: getBatchProxy(effectQueries).map(({ structure }) => structure),
    };
  });
};

/**
 * Determines whether the provided value is storable as a binary object, or not.
 *
 * @param value - The value to check.
 *
 * @returns A boolean indicating whether the provided value is storable, or not.
 */
const isStorableObject = (value: unknown): boolean =>
  (typeof File !== 'undefined' && value instanceof File) ||
  (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream) ||
  (typeof Blob !== 'undefined' && value instanceof Blob) ||
  (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) ||
  (typeof Buffer !== 'undefined' && Buffer.isBuffer(value));

/**
 * Serializes syntax structures to ensure that the final structure can be sent over the
 * network and/or passed to the query compiler. For example, `Date` objects will be
 * converted into ISO strings.
 *
 * @param structure - The structure to serialize.
 *
 * @returns The serialized structure.
 */
export const serializeSyntaxStructure = (structure: unknown) => {
  const string = JSON.stringify(structure, (_key: string, value: unknown) => {
    return isStorableObject(value) ? { __storableObject: true, value } : value;
  });

  return JSON.parse(string, (_key: string, value: unknown) => {
    if (
      typeof value === 'object' &&
      value !== null &&
      '__storableObject' in value &&
      'value' in value
    ) {
      return value.value;
    }

    return value;
  });
};
