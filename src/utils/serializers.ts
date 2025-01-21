import { type SyntaxItem, getBatchProxy } from '@/src/queries';
import type { PrimitivesItem } from '@/src/schema/model';
import {
  type GetInstructions,
  type ModelField,
  type ModelTrigger,
  QUERY_SYMBOLS,
  type Query,
  type WithInstruction,
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

      // Pass columns into check function
      const fieldKeys = Object.keys(fields).reduce<Record<string, unknown>>(
        (acc, item) => {
          acc[item] = { [QUERY_SYMBOLS.FIELD]: item };
          return acc;
        },
        {},
      );

      if ('defaultValue' in value && typeof value.defaultValue === 'function') {
        value.defaultValue = value.defaultValue();
      }

      if (
        'computedAs' in value &&
        value.computedAs &&
        'value' in value.computedAs &&
        typeof value.computedAs.value === 'function'
      ) {
        value.computedAs.value = value.computedAs.value(
          fieldKeys as Record<string, string>,
        );
      }
      if ('check' in value && typeof value.check === 'function') {
        value.check = value.check(
          fieldKeys as Record<string, string>,
        ) as unknown as PrimitivesItem;
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
