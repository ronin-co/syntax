import type { link } from '@/src/index';
import type { NestedFields, Primitives } from '@/src/model/model';
import type { ModelField, ModelTrigger } from '@ronin/compiler';
import type { GetInstructions, Query, WithInstruction } from 'ronin/types';
import { getBatchProxy } from 'ronin/utils';

const ASYNC_CONTEXT = new (await import('node:async_hooks')).AsyncLocalStorage();

/**
 * Serialize fields from `Record<string, Primitives>` to `Model<Fields>`.
 *
 * @param fields - The fields to serialize.
 *
 * @returns The serialized fields.
 */
export const serializeFields = (fields?: Record<string, Primitives>) => {
  return Object.entries(fields ?? {}).flatMap(
    ([key, value]): Array<ModelField> | ModelField => {
      if (!('type' in value)) {
        const result: Record<string, Primitives> = {};

        for (const k of Object.keys(value)) {
          result[`${key}.${k}`] = value[k];
        }

        return serializeFields(result);
      }

      const { type, unique, defaultValue, required, name } = value as unknown as Exclude<
        Primitives,
        NestedFields
      >;
      const { actions, model } = value as unknown as ReturnType<typeof link>;

      return {
        slug: key,
        name,
        unique: unique ?? false,
        required: required ?? false,
        defaultValue,
        // @ts-expect-error: The `type` property exists in the model.
        type,
        // @ts-expect-error: The `target` property exists in the model.
        target: model?.slug,
        actions,
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
    { asyncContext: ASYNC_CONTEXT },
    (queries) => {
      return queries.map((query) => query.query);
    },
  );
  return queryObject;
};
