import { model } from '@/src/schema';
import { mutateStructure, setProperty } from '@/src/utils';
import { QUERY_SYMBOLS, type Query } from '@ronin/compiler';

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

/**
 * Used to track whether RONIN queries are run in batches.
 */
let IN_BATCH = false;

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
 *   root: `${QUERY_SYMBOLS.QUERY}.get`,
 *   // Execute the query and return the result
 *   callback: async (query) => {}
 * });
 *
 * const result = await get.account();
 *
 * const result = await get.account.with.email('mike@gmail.com');
 * ```
 */
export const getSyntaxProxy = (config?: {
  root?: string;
  callback?: (query: Query, options?: Record<string, unknown>) => Promise<any> | any;
  replacer?: (value: unknown) => { value: unknown; serialize: boolean };
  propertyValue?: unknown;
}) => {
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

    // Ensure that the target can be serialized by `JSON.stringify()`.
    Object.defineProperty(proxyTargetFunction, 'toJSON', {
      value() {
        return { ...this };
      },
      enumerable: false, // The property hould not appear during enumeration.
    });

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

          // Since `value()` is synchronous, `IN_BATCH` should not affect any other
          // queries somewhere else in the app, even if those are run inside an
          // asynchronous function.
          IN_BATCH = true;

          // A proxy object providing a property for every field of the model. It allows
          // for referencing fields inside of an expression.
          const fieldProxy = new Proxy(
            {},
            {
              get(_target, property) {
                const name = property.toString();

                return {
                  [QUERY_SYMBOLS.EXPRESSION]: `${QUERY_SYMBOLS.FIELD}${name}`,
                };
              },
            },
          );

          value = { ...value(fieldProxy) };

          // Restore the original value of `IN_BATCH`.
          IN_BATCH = ORIGINAL_IN_BATCH;
        }

        if (typeof value !== 'undefined') {
          // Serialize the value to ensure that the final structure can be sent over the
          // network and/or passed to the query compiler.
          //
          // For example, `Date` objects will be converted into ISO strings.
          value = mutateStructure(value, (value) => {
            // Never serialize `undefined` values, as they are not valid JSON.
            if (typeof value === 'undefined') return value;

            // If a custom replacer function was provided, serialize the value with it.
            if (config?.replacer) {
              const replacedValue = config.replacer(value);

              // If the replacer function returns a value, use it.
              if (typeof replacedValue !== 'undefined') return replacedValue;
            }

            // Otherwise, default to serializing the value as JSON.
            return JSON.parse(JSON.stringify(value));
          });
        }

        // If the function call is happening after an existing function call in the
        // same query, the existing query will be available as `target.structure`, and
        // we should extend it. If none is available, we should create a new query.
        const structure = target || {};
        const targetValue = typeof value === 'undefined' ? propertyValue : value;

        const pathParts = config?.root ? [config.root, ...path] : path;
        const pathJoined = pathParts.length > 0 ? pathParts.join('.') : '.';

        console.log('TARGET', structure)
        console.log('PROPERTY ASSIGNMENT', targetValue)
        setProperty(structure, pathJoined, targetValue);

        // If a `create.model` query was provided, serialize the model structure.
        if (
          config?.root === `${QUERY_SYMBOLS.QUERY}.create` &&
          structure?.[QUERY_SYMBOLS.QUERY]?.create?.model
        ) {
          // Temporarily store the original value of `IN_BATCH`, so that we can resume it
          // after the nested function has been called.
          const ORIGINAL_IN_BATCH = IN_BATCH;

          // Since `value()` is synchronous, `IN_BATCH` should not affect any other
          // queries somewhere else in the app, even if those are run inside an
          // asynchronous function.
          IN_BATCH = true;

          structure[QUERY_SYMBOLS.QUERY].create.model = model(
            structure?.[QUERY_SYMBOLS.QUERY]?.create.model,
          );

          // Restore the original value of `IN_BATCH`.
          IN_BATCH = ORIGINAL_IN_BATCH;
        }

        // If the function call is happening inside a batch, return a new proxy, to
        // allow for continuing to chain `get` accessors and function calls after
        // existing function calls in the same query.
        if (IN_BATCH || !config?.callback) {
          // To ensure that `get` accessor calls are mounted to the same level as
          // the function after which they are called, we need to remove the last
          // path segment.
          const newPath = path.slice(0, -1);
          const details: SyntaxItem = { ...structure };

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
};

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
  return queries.map((details) => {
    const item = { structure: details.structure[QUERY_SYMBOLS.QUERY] };
    if ('options' in details) item.options = details.options;
    return item;
  }) as Array<SyntaxItem<Query>>;
};

export { getProperty, setProperty } from '@/src/utils';
export type { ResultRecord, DeepCallable } from '@/src/queries/types';
export { getSyntaxProxySQL, getBatchProxySQL } from '@/src/queries/statements';
