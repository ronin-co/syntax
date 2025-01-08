import { getBatchProxy } from '@/src/queries';
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
export const serializeFields = (fields?: Record<string, PrimitivesItem>) => {
  return Object.entries(fields ?? {}).flatMap(
    ([key, initialValue]): Array<ModelField> | ModelField => {
      let value = initialValue?.structure;

      if (typeof value === 'undefined') {
        value = initialValue as Record<string, PrimitivesItem>;
        const result: typeof value = {};

        for (const k of Object.keys(value)) {
          result[`${key}.${k}`] = value[k];
        }

        return serializeFields(result);
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
  presets?: Record<string, WithInstruction | GetInstructions>,
) => {
  if (!presets) return undefined;
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
export const serializeTriggers = (triggers?: Array<ModelTrigger<Array<ModelField>>>) => {
  if (!triggers) return undefined;

  return triggers.map((trigger) => {
    return {
      ...trigger,
      effects: serializeQueries(trigger.effects as unknown as () => Array<Query>),
    };
  });
};

/**
 * Serialize a RONIN query to query objects.
 *
 * @param queries - The query to serialize.
 *
 * @returns The serialized query.
 */
export const serializeQueries = (query: () => Array<Query>) => {
  const queryObject = getBatchProxy(
    () => {
      return query();
    },
    {},
    (queries) => {
      return queries.map((query) => query.structure);
    },
  );
  return queryObject;
};
