import type { DeepCallable } from '@/src/queries/types';
import { model } from '@/src/schema';
import type { Model } from '@/src/schema/model';
import { setProperty } from '@/src/utils';
import {
  type AddQuery,
  type AlterQuery,
  type CountQuery,
  type DropQuery,
  type GetQuery,
  type ModelField,
  type ModelIndex,
  type ModelPreset,
  type ModelTrigger,
  type CreateQuery as OriginalCreateQuery,
  QUERY_SYMBOLS,
  type Query,
  type RemoveQuery,
  type SetQuery,
} from '@ronin/compiler';

/** Used to separate the components of an expression from each other. */
const RONIN_EXPRESSION_SEPARATOR = '//.//';

/**
 * Utility type to convert a tuple of promises into a tuple of their resolved types.
 */
export type PromiseTuple<
  T extends [Promise<any>, ...Array<Promise<any>>] | Array<Promise<any>>,
> = {
  [P in keyof T]: Awaited<T[P]>;
};

/**
 * Utility type that represents a particular query and any options that should
 * be used when executing it.
 */
export interface SyntaxItem<Structure = unknown> {
  structure: Structure;
  options?: Record<string, unknown>;
}

interface CreateQuery extends Omit<OriginalCreateQuery, 'model' | 'to'> {
  model: string | Model;
  to?: Model;
}

/**
 * Used to track whether queries run in batches if `AsyncLocalStorage` is not
 * available for use.
 */
let IN_BATCH = false;

export function getSyntaxProxy(config?: {
  rootProperty?: never;
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): any;

export function getSyntaxProxy(config?: {
  rootProperty?: 'get';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<GetQuery>;

export function getSyntaxProxy(config?: {
  rootProperty?: 'set';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<SetQuery>;

export function getSyntaxProxy(config?: {
  rootProperty?: 'add';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<AddQuery>;

export function getSyntaxProxy(config?: {
  rootProperty?: 'remove';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<RemoveQuery>;

export function getSyntaxProxy(config?: {
  rootProperty?: 'count';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<CountQuery, number>;

export function getSyntaxProxy(config?: {
  rootProperty?: 'create';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<CreateQuery, Model>;

export function getSyntaxProxy(config?: {
  rootProperty?: 'alter';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<
  AlterQuery,
  Model | ModelField | ModelIndex | ModelTrigger | ModelPreset
>;

export function getSyntaxProxy(config?: {
  rootProperty?: 'drop';
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}): DeepCallable<DropQuery, Model>;

/**
 * A utility function that creates a proxy object to handle dynamic property access and
 * function calls, which is used to compose the query and schema syntax.
 *
 * @param config - An object containing configuration for the composed structure.
 *
 * @returns A proxy object that intercepts property access and function calls.
 *
 * ### Usage
 * ```typescript
 * const get = getSyntaxProxy({
 *   rootProperty: 'get',
 *   // Execute the query and return the result
 *   callback: async (query) => {}
 * });
 *
 * const result = await get.account();
 *
 * const result = await get.account.with.email('mike@gmail.com');
 * ```
 */
export function getSyntaxProxy(config?: {
  rootProperty?: string;
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  propertyValue?: unknown;
}):
  | DeepCallable<GetQuery>
  | DeepCallable<SetQuery>
  | DeepCallable<AddQuery>
  | DeepCallable<RemoveQuery>
  | DeepCallable<CountQuery, number>
  | DeepCallable<CreateQuery, Model>
  | DeepCallable<AlterQuery, Model | ModelField | ModelIndex | ModelTrigger | ModelPreset>
  | DeepCallable<DropQuery, Model> {
  // The default value of a property within the composed structure.
  const propertyValue =
    typeof config?.propertyValue === 'undefined' ? {} : config.propertyValue;

  function createProxy(path: Array<string>, targetProps?: SyntaxItem) {
    const proxyTargetFunction = () => undefined;

    // This is workaround to avoid "uncalled functions" in the test
    // coverage report. Test coverage tools fail to recognize that the
    // function is called when it's called via a Proxy.
    proxyTargetFunction();

    // Since the proxy target must always be a function (so that it can be called),
    // we need to assign properties to the function itself.
    if (targetProps) Object.assign(proxyTargetFunction, targetProps);

    // @ts-expect-error Deleting this property is required for fields called `name`.
    delete proxyTargetFunction.name;

    return new Proxy(proxyTargetFunction, {
      apply(target: any, _thisArg: any, args: Array<any>) {
        let value = args[0];
        const options = args[1];

        // If a function is provided as the argument for the query, call it and make
        // all queries within it think they are running inside a batch transaction,
        // in order to retrieve their serialized values.
        if (typeof value === 'function') {
          // Temporarily store the original value of `IN_BATCH`, so that we can resume it
          // after the nested function has been called.
          const ORIGINAL_IN_BATCH = IN_BATCH;

          // Since `value()` is synchronous, `IN_BATCH` should not affect any
          // other queries somewhere else in the app, even if those are run inside
          // an asynchronous function, so we don't need to use `IN_BATCH_ASYNC`,
          // which avoids the need to pass it as an option to the client.
          IN_BATCH = true;

          // A proxy object providing a property for every field of the model. It allows
          // for referencing fields inside of an expression.
          const fieldProxy = new Proxy(
            {},
            {
              get(_target, property) {
                const name = property.toString();
                const split = RONIN_EXPRESSION_SEPARATOR;

                return `${split}${QUERY_SYMBOLS.FIELD}${name}${split}`;
              },
            },
          );

          const instructions = value(fieldProxy);

          if (instructions.structure) {
            value = { [QUERY_SYMBOLS.QUERY]: instructions.structure };
          } else {
            value = instructions;
          }

          if (isExpression(value)) {
            value = wrapExpression(value as string);
          } else if (typeof value === 'object') {
            value = wrapExpressions(value);
          }

          // Restore the original value of `IN_BATCH`.
          IN_BATCH = ORIGINAL_IN_BATCH;
        }

        // If the function call is happening after an existing function call in the
        // same query, the existing query will be available as `target.structure`, and
        // we should extend it. If none is available, we should create a new query.
        const structure = target.structure || {};
        const targetValue = typeof value === 'undefined' ? propertyValue : value;

        const pathParts = config?.rootProperty ? [config.rootProperty, ...path] : path;
        const pathJoined = pathParts.length > 0 ? pathParts.join('.') : '.';

        setProperty(structure, pathJoined, targetValue);

        // If a `create.model` query was provided, serialize the model structure.
        if (config?.rootProperty === 'create' && structure?.create?.model) {
          structure.create.model = model(structure.create.model);
        }

        // If the function call is happening inside a batch, return a new proxy, to
        // allow for continuing to chain `get` accessors and function calls after
        // existing function calls in the same query.
        if (IN_BATCH || !config?.callback) {
          // To ensure that `get` accessor calls are mounted to the same level as
          // the function after which they are called, we need to remove the last
          // path segment.
          const newPath = path.slice(0, -1);
          const details: SyntaxItem = { structure };

          // Only add options if any are available, to avoid adding a property that
          // holds an `undefined` value.
          if (options) details.options = options;

          return createProxy(newPath, details);
        }

        return config.callback(structure, options);
      },

      get(target: any, nextProp: string, receiver: any): any {
        // If the target object of the proxy has a static property that matches the
        // provided property name, return its value.
        if (Object.hasOwn(target, nextProp)) {
          return Reflect.get(target, nextProp, receiver);
        }

        // If the target object does not have a matching static property, return a
        // new proxy, to allow for chaining `get` accessors.
        return createProxy(path.concat([nextProp]), target);
      },
    });
  }

  return createProxy([]);
}

/**
 * Obtains a list of queries from a function by wrapping the queries into a context.
 *
 * @param operations - A function that contains multiple query functions.
 *
 * @returns A list of queries and their respective options.
 *
 * ### Usage
 * ```typescript
 * const queries = getBatchProxy(() => [
 *   get.accounts(),
 *   get.account.with.email('mike@gmail.com')
 * ]);
 * ```
 */
export const getBatchProxy = (
  operations: () => Array<SyntaxItem<Query> | Promise<any>>,
): Array<SyntaxItem<Query>> => {
  let queries: Array<SyntaxItem<Query> | Promise<any>> = [];

  IN_BATCH = true;
  queries = operations();
  IN_BATCH = false;

  // Within a batch, every query item is a JavaScript `Proxy`, in order to allow for
  // function chaining within every query. Returning the query items directly would
  // therefore return the respective `Proxy` instances, which wouldn't be logged as plain
  // objects, thereby making development more difficult. To avoid this, we are creating a
  // plain object containing the same properties as the `Proxy` instances.
  return queries.map((details) => ({ ...details })) as Array<SyntaxItem<Query>>;
};

type NestedObject = {
  [key: string]: unknown | NestedObject;
};

/**
 * Checks whether a given value is a query expression.
 *
 * @param value - The value to check.
 *
 * @returns A boolean indicating whether or not the provided value is an expression.
 */
const isExpression = (value: unknown): boolean => {
  return typeof value === 'string' && value.includes(RONIN_EXPRESSION_SEPARATOR);
};

/**
 * Wraps an expression string into a query symbol that allows the compiler to easily
 * detect and process it.
 *
 * @param value - The expression to wrap.
 *
 * @returns The provided expression wrapped in a query symbol.
 */
const wrapExpression = (
  value: string,
): Record<typeof QUERY_SYMBOLS.EXPRESSION, string> => {
  const components = value
    .split(RONIN_EXPRESSION_SEPARATOR)
    .filter((part) => part.length > 0)
    .map((part) => {
      return part.startsWith(QUERY_SYMBOLS.FIELD) ? part : `'${part}'`;
    })
    .join(' || ');

  return { [QUERY_SYMBOLS.EXPRESSION]: components };
};

/**
 * Recursively checks an object for query expressions and, if they are found, wraps them
 * in a query symbol that allows the compiler to easily detect and process them.
 *
 * @param obj - The object containing potential expressions.
 *
 * @returns The updated object.
 */
const wrapExpressions = (obj: NestedObject): NestedObject =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (isExpression(value)) return [key, wrapExpression(value as string)];

      return [
        key,
        value && typeof value === 'object'
          ? wrapExpressions(value as NestedObject)
          : value,
      ];
    }),
  );

export { getProperty, setProperty } from '@/src/utils';
