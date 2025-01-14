import { QUERY_SYMBOLS } from '@ronin/compiler';

const expression = (expression: string | number) => {
  return { [QUERY_SYMBOLS.EXPRESSION]: expression };
};

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
  return expression(expressions);
};

/** Valid operators for string concatenation */
type StringOperator = '||';

/** Valid arithmetic operators for numbers */
type NumberOperator = '+' | '-' | '*' | '/' | '%';

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
  operator: T extends string ? StringOperator : NumberOperator,
  right: T,
) => {
  const leftValue =
    typeof left === 'object' && QUERY_SYMBOLS.EXPRESSION in left
      ? left[QUERY_SYMBOLS.EXPRESSION]
      : left;
  const rightValue =
    typeof right === 'object' && QUERY_SYMBOLS.EXPRESSION in right
      ? right[QUERY_SYMBOLS.EXPRESSION]
      : right;
  const wrappedLeft =
    typeof leftValue === 'string' &&
    !(typeof left === 'object' && QUERY_SYMBOLS.EXPRESSION in left)
      ? `'${leftValue}'`
      : leftValue;
  const wrappedRight =
    typeof rightValue === 'string' &&
    !(typeof right === 'object' && QUERY_SYMBOLS.EXPRESSION in right)
      ? `'${rightValue}'`
      : rightValue;

  return expression(`${wrappedLeft} ${operator} ${wrappedRight}`) as unknown as T;
};

/**
 * Generates a pseudo-random integer between -9223372036854775808 and +9223372036854775807.
 *
 * @returns SQL expression that evaluates to a random number
 */
export const random = (): number => {
  return expression('random()') as unknown as number;
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
  return expression(`abs(${valueExpression})`) as unknown as number;
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
  return expression(`strftime('${format}', '${timestamp}')`) as unknown as string;
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
  return expression(`json_patch('${patch}', '${input}')`) as unknown as string;
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
  return expression(`json_set('${json}', '${path}', '${value}')`) as unknown as string;
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
  return expression(
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
  return expression(`json_insert('${json}', '${path}', '${value}')`) as unknown as string;
};
