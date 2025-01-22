import type { ResultRecord as OriginalRecord } from '@ronin/compiler';

export type ResultRecord = Omit<OriginalRecord, 'ronin'> & {
  ronin: Omit<OriginalRecord['ronin'], 'createdAt' | 'updatedAt'> & {
    createdAt: Date;
    updatedAt: Date;
  };
};

/**
 * A recursive type making every property callable and chainable.
 *
 * - If `Query` (minus null/undefined) is an object:
 * -- The call signature is `(arg?: Partial<NonNullable<Query>>) => Promise<Result> & DeepCallable<Query>`.
 * -- Each key in `Query` is also a `DeepCallable`, excluding null/undefined from the
 * sub-type so that calls to optional properties do not raise "possibly undefined" errors.
 *
 * - Otherwise (if it's a primitive like string/number/etc, or strictly null/undefined):
 * -- The call signature is `(arg?: Query) => Promise<Result> & DeepCallable<Query>`.
 * -- Can call it with an optional argument, and it returns a promise & chainable methods.
 *
 * This approach means you can do e.g. `get.spaces.orderedBy.descending(['handle'])`
 * without TS complaining about `descending` being possibly undefined, and every call
 * remains `await`able (returning `Result`) as well as chainable.
 */
export type DeepCallable<Query, Result = ResultRecord> = [NonNullable<Query>] extends [
  // Non-distributive check to see if Query is object-like (including Query|null).
  object,
]
  ? /**
     * Calls the object with an optional partial argument, returning a promise that
     * resolves to `Result` and also remains a DeepCallable for further nested calls.
     */
    ObjectCall<Query, Result, Partial<NonNullable<Query>>> & {
      /**
       * For each key in Query, exclude null/undefined so we can call it without TS
       * complaining about it possibly being undefined.
       */
      [K in keyof NonNullable<Query>]-?: DeepCallable<
        Exclude<NonNullable<Query>[K], null | undefined>,
        Result
      >;
    }
  : /**
     * Calls this primitive (or null/undefined) with an optional argument, returning
     * a promise that resolves to `Result` and remains chainable as DeepCallable.
     */
    ObjectCall<Query, Result, Query>;

/**
 * A helper function type used by `DeepCallable`.
 *
 * @typeParam Query - The `Query` type for recursion.
 * @typeParam DefaultResult - The default result if no generic is specified.
 * @typeParam Arg - The type of the call's optional argument.
 *
 * The call returns a `Promise<FinalResult>`, with `FinalResult` defaulting to
 * `DefaultResult` if no generic is provided. It also remains chainable by returning
 * `DeepCallable<Query, FinalResult>`.
 */
type ObjectCall<Query, DefaultResult, Arg> = (<FinalResult = DefaultResult>(
  arg?: ((f: Record<string, unknown>) => Arg | any) | Arg,
  options?: Record<string, unknown>,
) => Promise<FinalResult> & DeepCallable<Query, FinalResult>) &
  ReducedFunction;

/**
 * Utility type to mark all Function.prototype methods as "deprecated" which
 * deranks them in the IDE suggestion popup.
 */
export interface ReducedFunction {
  /**
   * @deprecated
   */
  name: never;
  /**
   * @deprecated
   */
  length: never;
  /**
   * @deprecated
   */
  apply: never;
  /**
   * @deprecated
   */
  call: never;
  /**
   * @deprecated
   */
  bind: never;
  /**
   * @deprecated
   */
  toString: never;
  /**
   * @deprecated
   */
  caller: never;
  /**
   * @deprecated
   */
  prototype: never;
  /**
   * @deprecated
   */
  arguments: never;
  /**
   * @deprecated
   */
  unify: never;
}
