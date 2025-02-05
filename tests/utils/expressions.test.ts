import { describe, expect, test } from 'bun:test';
import {
  abs,
  json_insert,
  json_patch,
  json_replace,
  json_set,
  op,
  random,
  sql,
  strftime,
  wrapExpression,
  wrapExpressions,
} from '@/src/expressions';
import { date, model, number, string } from '@/src/schema';

describe('expressions', () => {
  test('sql expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(() => sql("UPPER('test')")),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: "UPPER('test')",
    });
  });

  describe('operator expressions', () => {
    test('string concatenation operator', () => {
      const Test = model({
        slug: 'test',
        fields: {
          stringConcat: string().defaultValue(() => op('Hello', '||', 'World')),
        },
      });
      // @ts-expect-error This exists
      expect(Test.fields[0].defaultValue).toEqual({
        __RONIN_EXPRESSION: "('Hello' || 'World')",
      });
    });

    describe('arithmetic operators', () => {
      test('addition', () => {
        const Test = model({
          slug: 'test',
          fields: {
            add: number().defaultValue(() => op(1, '+', 2)),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].defaultValue).toEqual({
          __RONIN_EXPRESSION: '(1 + 2)',
        });
      });

      test('subtraction', () => {
        const Test = model({
          slug: 'test',
          fields: {
            subtract: number().defaultValue(() => op(5, '-', 3)),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].defaultValue).toEqual({
          __RONIN_EXPRESSION: '(5 - 3)',
        });
      });

      test('multiplication', () => {
        const Test = model({
          slug: 'test',
          fields: {
            multiply: number().defaultValue(() => op(4, '*', 2)),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].defaultValue).toEqual({
          __RONIN_EXPRESSION: '(4 * 2)',
        });
      });

      test('division', () => {
        const Test = model({
          slug: 'test',
          fields: {
            divide: number().defaultValue(() => op(10, '/', 2)),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].defaultValue).toEqual({
          __RONIN_EXPRESSION: '(10 / 2)',
        });
      });

      test('modulo', () => {
        const Test = model({
          slug: 'test',
          fields: {
            modulo: number().defaultValue(() => op(7, '%', 3)),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].defaultValue).toEqual({
          __RONIN_EXPRESSION: '(7 % 3)',
        });
      });
    });

    describe('comparison operators', () => {
      test('equals', () => {
        const Test = model({
          slug: 'test',
          fields: {
            equals: string().check((fields) => op(fields.equals, '=', 'test')),
            equalsRight: string().check((fields) => op('test', '=', fields.equalsRight)),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].check).toEqual({
          __RONIN_EXPRESSION: "(__RONIN_FIELD_equals = 'test')",
        });
        // @ts-expect-error This exists
        expect(Test.fields[1].check).toEqual({
          __RONIN_EXPRESSION: "('test' = __RONIN_FIELD_equalsRight)",
        });
      });

      test('not equals', () => {
        const Test = model({
          slug: 'test',
          fields: {
            notEquals: string().check((fields) => op(fields.notEquals, '!=', 'test')),
            notEqualsRight: string().check((fields) =>
              op('test', '!=', op(fields.notEqualsRight, '!=', 'test')),
            ),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].check).toEqual({
          __RONIN_EXPRESSION: "(__RONIN_FIELD_notEquals != 'test')",
        });
        // @ts-expect-error This exists
        expect(Test.fields[1].check).toEqual({
          __RONIN_EXPRESSION: "('test' != (__RONIN_FIELD_notEqualsRight != 'test'))",
        });
      });

      test('greater than', () => {
        const Test = model({
          slug: 'test',
          fields: {
            greaterThan: number().check((fields) => op(fields.greaterThan, '>', 5)),
            greaterThanRight: number().check((fields) =>
              op(5, '>', fields.greaterThanRight),
            ),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].check).toEqual({
          __RONIN_EXPRESSION: '(__RONIN_FIELD_greaterThan > 5)',
        });
        // @ts-expect-error This exists
        expect(Test.fields[1].check).toEqual({
          __RONIN_EXPRESSION: '(5 > __RONIN_FIELD_greaterThanRight)',
        });
      });

      test('less than', () => {
        const Test = model({
          slug: 'test',
          fields: {
            lessThan: number().check((fields) =>
              op(op(fields.lessThan, '<', 5), '<', op(fields.lessThan, '<', 5)),
            ),
            lessThanRight: number().check((fields) =>
              op(op(5, '<', fields.lessThanRight), '<', op(5, '<', fields.lessThanRight)),
            ),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].check).toEqual({
          __RONIN_EXPRESSION:
            '((__RONIN_FIELD_lessThan < 5) < (__RONIN_FIELD_lessThan < 5))',
        });
        // @ts-expect-error This exists
        expect(Test.fields[1].check).toEqual({
          __RONIN_EXPRESSION:
            '((5 < __RONIN_FIELD_lessThanRight) < (5 < __RONIN_FIELD_lessThanRight))',
        });
      });

      test('greater than or equal', () => {
        const Test = model({
          slug: 'test',
          fields: {
            greaterThanEqual: number().check((fields) =>
              op(fields.greaterThanEqual, '>=', 5),
            ),
            greaterThanEqualRight: number().check((fields) =>
              op(5, '>=', fields.greaterThanEqualRight),
            ),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].check).toEqual({
          __RONIN_EXPRESSION: '(__RONIN_FIELD_greaterThanEqual >= 5)',
        });
        // @ts-expect-error This exists
        expect(Test.fields[1].check).toEqual({
          __RONIN_EXPRESSION: '(5 >= __RONIN_FIELD_greaterThanEqualRight)',
        });
      });

      test('less than or equal', () => {
        const Test = model({
          slug: 'test',
          fields: {
            lessThanEqual: number().check((fields) => op(fields.lessThanEqual, '<=', 5)),
            lessThanEqualRight: number().check((fields) =>
              op(5, '<=', fields.lessThanEqualRight),
            ),
          },
        });
        // @ts-expect-error This exists
        expect(Test.fields[0].check).toEqual({
          __RONIN_EXPRESSION: '(__RONIN_FIELD_lessThanEqual <= 5)',
        });
        // @ts-expect-error This exists
        expect(Test.fields[1].check).toEqual({
          __RONIN_EXPRESSION: '(5 <= __RONIN_FIELD_lessThanEqualRight)',
        });
      });
    });
  });

  test('operator expressions', () => {
    const Test = model({
      slug: 'test',
      fields: {
        stringConcat: string().defaultValue(() => op('Hello', '||', 'World')),
        numberAdd: number().defaultValue(() => op(1, '+', 2)),
        numberSubtract: number().defaultValue(() => op(5, '-', 3)),
        numberMultiply: number().defaultValue(() => op(4, '*', 2)),
        numberDivide: number().defaultValue(() => op(10, '/', 2)),
        numberModulo: number().defaultValue(() => op(7, '%', 3)),
        stringCompare: string().check((fields) =>
          op(fields.stringConcat, '=', 'HelloWorld'),
        ),
        numberCompare: number().check((fields) => op(fields.numberAdd, '>=', 3)),
        rightSideField: string().check((fields) => op('Hello', '=', fields.stringConcat)),
        computedAs: string().computedAs((fields) => ({
          kind: 'VIRTUAL',
          value: op(fields.numberAdd, '||', fields.numberSubtract),
        })),
      },
    });

    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: "('Hello' || 'World')",
    });
    // @ts-expect-error This exists
    expect(Test.fields[1].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(1 + 2)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[2].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(5 - 3)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[3].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(4 * 2)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[4].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(10 / 2)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[5].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(7 % 3)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[6].check).toEqual({
      __RONIN_EXPRESSION: "(__RONIN_FIELD_stringConcat = 'HelloWorld')",
    });
    // @ts-expect-error This exists
    expect(Test.fields[7].check).toEqual({
      __RONIN_EXPRESSION: '(__RONIN_FIELD_numberAdd >= 3)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[8].check).toEqual({
      __RONIN_EXPRESSION: "('Hello' = __RONIN_FIELD_stringConcat)",
    });
    // @ts-expect-error This exists
    expect(Test.fields[9].computedAs).toEqual({
      kind: 'VIRTUAL',
      value: {
        __RONIN_EXPRESSION: '(__RONIN_FIELD_numberAdd || __RONIN_FIELD_numberSubtract)',
      },
    });
  });

  test('default expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test1: string().defaultValue(() => 'test'),
        test2: string().defaultValue(() => op('Hello', '||', 'World')),
        test3: string().defaultValue(() => op(op('Hello', '||', 'World'), '||', 'test')),
        test4: string().defaultValue(() =>
          op(op('Hello', '||', 'World'), '||', op('Hello', '||', 'World')),
        ),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual('test');
    // @ts-expect-error This exists
    expect(Test.fields[1].defaultValue).toEqual({
      __RONIN_EXPRESSION: "('Hello' || 'World')",
    });
    // @ts-expect-error This exists
    expect(Test.fields[2].defaultValue).toEqual({
      __RONIN_EXPRESSION: "(('Hello' || 'World') || 'test')",
    });
    // @ts-expect-error This exists
    expect(Test.fields[3].defaultValue).toEqual({
      __RONIN_EXPRESSION: "(('Hello' || 'World') || ('Hello' || 'World'))",
    });
  });

  test('random expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: number().defaultValue(() => random()),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'random()',
    });
  });

  test('abs expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        numberAbs: number().defaultValue(() => abs(-42)),
        expressionAbs: number().defaultValue(() => abs(op(1, '-', 5))),
      },
    });

    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'abs(-42)',
    });

    // @ts-expect-error This exists
    expect(Test.fields[1].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'abs((1 - 5))',
    });
  });

  test('strftime expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        currentDate: date().defaultValue(() => strftime('%Y-%m-%d', 'now')),
        customFormat: date().defaultValue(() => strftime('%H:%M:%S', 'now')),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: "strftime('%Y-%m-%d', 'now')",
    });
    // @ts-expect-error This exists
    expect(Test.fields[1].defaultValue).toEqual({
      __RONIN_EXPRESSION: "strftime('%H:%M:%S', 'now')",
    });
  });

  test('json expressions', () => {
    const Test = model({
      slug: 'test',
      fields: {
        jsonPatch: string().defaultValue(() =>
          json_patch('{"op": "add", "path": "/foo", "value": "qux"}', '{"foo": "bar"}'),
        ),
        jsonSet: string().defaultValue(() =>
          json_set('{"foo": "bar", "baz": "qux"}', '$.foo', '"updated"'),
        ),
        jsonReplace: string().defaultValue(() =>
          json_replace('{"foo": "bar", "baz": "qux"}', '$.foo', '"replaced"'),
        ),
        jsonInsert: string().defaultValue(() =>
          json_insert('{"foo": "bar"}', '$.newKey', '"inserted"'),
        ),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION:
        'json_patch(\'{"op": "add", "path": "/foo", "value": "qux"}\', \'{"foo": "bar"}\')',
    });
    // @ts-expect-error This exists
    expect(Test.fields[1].defaultValue).toEqual({
      __RONIN_EXPRESSION:
        'json_set(\'{"foo": "bar", "baz": "qux"}\', \'$.foo\', \'"updated"\')',
    });
    // @ts-expect-error This exists
    expect(Test.fields[2].defaultValue).toEqual({
      __RONIN_EXPRESSION:
        'json_replace(\'{"foo": "bar", "baz": "qux"}\', \'$.foo\', \'"replaced"\')',
    });
    // @ts-expect-error This exists
    expect(Test.fields[3].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'json_insert(\'{"foo": "bar"}\', \'$.newKey\', \'"inserted"\')',
    });
  });

  test('nested expressions', () => {
    const Test = model({
      slug: 'test',
      fields: {
        randomPlusTwo: number().defaultValue(() => op(random(), '+', 2)),
        absOfRandom: number().defaultValue(() => abs(random())),
        complexNesting: number().defaultValue(() =>
          abs(op(random(), '*', op(2, '+', 3))),
        ),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(random() + 2)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[1].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'abs(random())',
    });
    // @ts-expect-error This exists
    expect(Test.fields[2].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'abs((random() * (2 + 3)))',
    });
  });

  test('wrap expressions', () => {
    const input = {
      simple: 'hello//.//world',
      nested: {
        value: 'foo//.//bar',
        normal: 'unchanged',
      },
      array: [{ __RONIN_EXPRESSION: "'not' || 'wrapped'" }],
      unchanged: 'no separator',
    };

    const result = wrapExpressions(input);

    expect(result).toEqual({
      simple: {
        __RONIN_EXPRESSION: "'hello' || 'world'",
      },
      nested: {
        value: {
          __RONIN_EXPRESSION: "'foo' || 'bar'",
        },
        normal: 'unchanged',
      },
      array: {
        '0': { __RONIN_EXPRESSION: "'not' || 'wrapped'" },
      },
      unchanged: 'no separator',
    });

    // Test with null/undefined values
    const inputWithNull = {
      nullValue: null,
      undefinedValue: undefined,
      nested: {
        nullValue: null,
        undefinedValue: undefined,
      },
    };
    const resultWithNull = wrapExpressions(inputWithNull);
    expect(resultWithNull).toEqual({
      nullValue: null,
      undefinedValue: undefined,
      nested: {
        nullValue: null,
        undefinedValue: undefined,
      },
    });

    // Test wrapExpression directly
    expect(wrapExpression('hello//.//world')).toEqual({
      __RONIN_EXPRESSION: "'hello' || 'world'",
    });
  });

  test('nested expressions', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(() =>
          op(op('Hello', '||', 'World'), '||', op('Hello', '||', 'World')),
        ),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: "(('Hello' || 'World') || ('Hello' || 'World'))",
    });
  });
});
