import { QUERY_SYMBOLS, getQuerySymbol } from '@ronin/compiler';

/**
 * Creates a query expression object that can be processed by the compiler.
 *
 * @param expression - The expression string to wrap in a query symbol.
 *
 * @returns An object containing the expression wrapped in a query symbol.
 */
export const expression = (
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
    .filter((part: string) => part.length > 0)
    .map((part: string) => {
      return part.startsWith(QUERY_SYMBOLS.FIELD) ? part : `'${part}'`;
    })
    .join(' || ');

  return expression(components);
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

/** Valid operators for string concatenation */
type StringOperator = '||';

/** Valid arithmetic operators for numbers */
type NumberOperator = '+' | '-' | '*' | '/' | '%';

/** Valid comparison operators for numbers and strings */
type ComparisonOperator = '=' | '!=' | '>' | '<' | '>=' | '<=';

/**
 * Creates a binary operation expression with type safety for operands.
 *
 * @param left - The left operand.
 * @param operator - The operator to use (string concatenation or arithmetic).
 * @param right - The right operand (must match type of left operand).
 *
 * @returns The formatted binary operation expression.
 */
export const op = <
  T extends string | number | Record<typeof QUERY_SYMBOLS.EXPRESSION, string>,
>(
  left: T,
  operator: NumberOperator | ComparisonOperator | StringOperator,
  right: T,
): T => {
  let leftValue = left;
  if (typeof left === 'object' && QUERY_SYMBOLS.EXPRESSION in left) {
    leftValue = left[QUERY_SYMBOLS.EXPRESSION] as T;
  }

  let rightValue = right;
  if (typeof right === 'object' && QUERY_SYMBOLS.EXPRESSION in right) {
    rightValue = right[QUERY_SYMBOLS.EXPRESSION] as T;
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

  return expression(`(${wrappedLeft} ${operator} ${wrappedRight})`) as unknown as T;
};
