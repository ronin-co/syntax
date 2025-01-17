import { QUERY_SYMBOLS, getQuerySymbol } from '@ronin/compiler';

export const createExpression = (
  expression: string,
): Record<typeof QUERY_SYMBOLS.EXPRESSION, string> => {
  return { [QUERY_SYMBOLS.EXPRESSION]: expression };
};

/** Used to separate the components of an expression from each other. */
export const RONIN_EXPRESSION_SEPARATOR = '//.//';

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
const containsExpressionString = (value: unknown): boolean => {
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
export const wrapExpression = (
  value: string,
): Record<typeof QUERY_SYMBOLS.EXPRESSION, string> => {
  const symbol = getQuerySymbol(value);
  const existingExpression = symbol?.type === 'expression' ? symbol : null;

  const components = (existingExpression ? existingExpression.value : value)
    .split(RONIN_EXPRESSION_SEPARATOR)
    .filter((part) => part.length > 0)
    .map((part) => {
      return part.startsWith(QUERY_SYMBOLS.FIELD) ? part : `'${part}'`;
    })
    .join(' || ');

  return createExpression(components);
};

/**
 * Recursively checks an object for query expressions and, if they are found, wraps them
 * in a query symbol that allows the compiler to easily detect and process them.
 *
 * @param obj - The object containing potential expressions.
 *
 * @returns The updated object.
 */
export const wrapExpressions = (obj: NestedObject): NestedObject =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (containsExpressionString(value)) return [key, wrapExpression(value as string)];

      return [
        key,
        value && typeof value === 'object'
          ? wrapExpressions(value as NestedObject)
          : value,
      ];
    }),
  );

/**
 * Wraps a raw SQL expression as-is.
 * Use with caution as this bypasses SQL injection protection.
 *
 * @param expressions The raw SQL expression to use
 *
 * @returns The wrapped SQL expression
 */
export const sql = (expressions: string) => {
  // TODO: Check expressions use '' rather than ""
  return createExpression(expressions);
};

/** Valid operators for string concatenation */
type StringOperator = '||';

/** Valid arithmetic operators for numbers */
type NumberOperator = '+' | '-' | '*' | '/' | '%';

/** Valid comparison operators for numbers and strings */
type ComparisonOperator = '=' | '!=' | '>' | '<' | '>=' | '<=';

/**
 * Creates a binary operation expression with type safety for operands.
 *
 * @param left The left operand
 * @param operator The operator to use (string concatenation or arithmetic)
 * @param right The right operand (must match type of left operand)
 *
 * @returns The formatted binary operation expression
 */
export const op = <T extends string | number | Record<string, string | number>>(
  left: T,
  operator: T extends string
    ? StringOperator | ComparisonOperator
    : NumberOperator | ComparisonOperator,
  right: T,
) => {
  let leftValue = left;
  if (typeof left === 'object') {
    if (QUERY_SYMBOLS.FIELD in left) {
      leftValue = left[QUERY_SYMBOLS.FIELD] as T;
    } else if (QUERY_SYMBOLS.EXPRESSION in left) {
      leftValue = left[QUERY_SYMBOLS.EXPRESSION] as T;
    }
  }

  let rightValue = right;
  if (typeof right === 'object') {
    if (QUERY_SYMBOLS.FIELD in right) {
      rightValue = right[QUERY_SYMBOLS.FIELD] as T;
    } else if (QUERY_SYMBOLS.EXPRESSION in right) {
      rightValue = right[QUERY_SYMBOLS.EXPRESSION] as T;
    }
  }

  let wrappedLeft = leftValue;
  if (
    typeof leftValue === 'string' &&
    !(
      typeof left === 'object' &&
      (QUERY_SYMBOLS.EXPRESSION in left || QUERY_SYMBOLS.FIELD in left)
    )
  ) {
    if (leftValue.startsWith(RONIN_EXPRESSION_SEPARATOR)) {
      wrappedLeft = leftValue.replaceAll(RONIN_EXPRESSION_SEPARATOR, '') as T;
    } else {
      wrappedLeft = `'${leftValue}'` as T;
    }
  }

  let wrappedRight = rightValue;
  if (
    typeof rightValue === 'string' &&
    !(
      typeof right === 'object' &&
      (QUERY_SYMBOLS.EXPRESSION in right || QUERY_SYMBOLS.FIELD in right)
    )
  ) {
    if (rightValue.startsWith(RONIN_EXPRESSION_SEPARATOR)) {
      wrappedRight = rightValue.replaceAll(RONIN_EXPRESSION_SEPARATOR, '') as T;
    } else {
      wrappedRight = `'${rightValue}'` as T;
    }
  }

  return createExpression(`${wrappedLeft} ${operator} ${wrappedRight}`) as unknown as T;
};

/**
 * Generates a pseudo-random integer between -9223372036854775808 and +9223372036854775807.
 *
 * @returns SQL expression that evaluates to a random number
 */
export const random = (): number => {
  return createExpression('random()') as unknown as number;
};

/**
 * Calculates the absolute value of a number.
 *
 * @param value The number to get absolute value of
 *
 * @returns SQL expression that evaluates to the absolute value
 */
export const abs = (value: number | Record<string, string | number>): number => {
  const valueExpression =
    typeof value === 'object' && QUERY_SYMBOLS.EXPRESSION in value
      ? value[QUERY_SYMBOLS.EXPRESSION]
      : value;
  return createExpression(`abs(${valueExpression})`) as unknown as number;
};

/**
 * Formats a timestamp according to the specified format string.
 *
 * @param format The format string (e.g. '%Y-%m-%d')
 * @param timestamp The timestamp to format, or 'now' for current time
 *
 * @returns SQL expression that evaluates to the formatted timestamp
 */
export const strftime = (format: string, timestamp: string | 'now'): string => {
  return createExpression(`strftime('${format}', '${timestamp}')`) as unknown as string;
};

/**
 * Applies a JSON patch operation to a JSON document.
 *
 * @param patch The JSON patch document defining the modifications
 * @param input The JSON document to patch
 *
 * @returns SQL expression that evaluates to the patched JSON document
 */
export const json_patch = (patch: string, input: string): string => {
  return createExpression(`json_patch('${patch}', '${input}')`) as unknown as string;
};

/**
 * Sets a value in a JSON document at the specified path.
 * Creates the path if it doesn't exist and overwrites if it does.
 *
 * @param json The JSON document to modify
 * @param path The path to set the value at
 * @param value The value to set
 *
 * @returns SQL expression that evaluates to the modified JSON document
 */
export const json_set = (json: string, path: string, value: string): string => {
  return createExpression(
    `json_set('${json}', '${path}', '${value}')`,
  ) as unknown as string;
};

/**
 * Replaces a value in a JSON document at the specified path.
 * Only modifies existing paths, will not create new ones.
 *
 * @param json The JSON document to modify
 * @param path The path to replace the value at
 * @param value The new value
 *
 * @returns SQL expression that evaluates to the modified JSON document
 */
export const json_replace = (json: string, path: string, value: string): string => {
  return createExpression(
    `json_replace('${json}', '${path}', '${value}')`,
  ) as unknown as string;
};

/**
 * Inserts a value into a JSON document at the specified path.
 * Only creates new paths, will not modify existing ones.
 *
 * @param json The JSON document to modify
 * @param path The path to insert the value at
 * @param value The value to insert
 *
 * @returns SQL expression that evaluates to the modified JSON document
 */
export const json_insert = (json: string, path: string, value: string): string => {
  return createExpression(
    `json_insert('${json}', '${path}', '${value}')`,
  ) as unknown as string;
};
