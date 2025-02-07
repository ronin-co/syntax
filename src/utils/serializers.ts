import { type SyntaxItem, getBatchProxy } from '@/src/queries';
import type { Model, PrimitivesItem } from '@/src/schema/model';
import type { ModelField, ModelTrigger, Query } from '@ronin/compiler';

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

        return [];
      }

      return {
        slug: key,
        ...value,
      };
    },
  );
};

/**
 * Serialize presets.
 *
 * @param presets - The presets to serialize.
 *
 * @returns The serialized presets.
 */
export const serializePresets = (presets: NonNullable<Model['presets']>) => {
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
