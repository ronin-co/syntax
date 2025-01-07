import type { Query } from '@ronin/compiler';

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
export interface QueryItem {
  query: Query;
  options?: Record<string, unknown>;
}
