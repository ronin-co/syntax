import { describe, expect, test } from 'bun:test';
import { date, model, number, string } from '@/src/schema';
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
  wrapExpressions,
} from '@/src/utils/expressions';

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

        stringConcat2: string({ defaultValue: () => op('Hello', '||', 'World') }),
        numberAdd2: number({ defaultValue: () => op(1, '+', 2) }),
        numberSubtract2: number({ defaultValue: () => op(5, '-', 3) }),
        numberMultiply2: number({ defaultValue: () => op(4, '*', 2) }),
        numberDivide2: number({ defaultValue: () => op(10, '/', 2) }),
        numberModulo2: number({ defaultValue: () => op(7, '%', 3) }),
        stringCompare2: string({
          check: (fields) => op(fields.stringConcat2, '=', 'HelloWorld'),
        }),
        numberCompare2: number({ check: (fields) => op(fields.numberAdd2, '>=', 3) }),
        rightSideField: string().check((fields) => op('Hello', '=', fields.stringConcat)),

        computedAs: string().computedAs({
          kind: 'VIRTUAL',
          value: (fields) => op(fields.numberAdd2, '+', fields.numberSubtract),
        }),
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
    expect(Test.fields[8].defaultValue).toEqual({
      __RONIN_EXPRESSION: "('Hello' || 'World')",
    });

    // @ts-expect-error This exists
    expect(Test.fields[9].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(1 + 2)',
    });

    // @ts-expect-error This exists
    expect(Test.fields[10].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(5 - 3)',
    });

    // @ts-expect-error This exists
    expect(Test.fields[11].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(4 * 2)',
    });

    // @ts-expect-error This exists
    expect(Test.fields[12].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(10 / 2)',
    });

    // @ts-expect-error This exists
    expect(Test.fields[13].defaultValue).toEqual({
      __RONIN_EXPRESSION: '(7 % 3)',
    });

    // @ts-expect-error This exists
    expect(Test.fields[14].check).toEqual({
      __RONIN_EXPRESSION: "(__RONIN_FIELD_stringConcat2 = 'HelloWorld')",
    });

    // @ts-expect-error This exists
    expect(Test.fields[15].check).toEqual({
      __RONIN_EXPRESSION: '(__RONIN_FIELD_numberAdd2 >= 3)',
    });

    // @ts-expect-error This exists
    expect(Test.fields[16].check).toEqual({
      __RONIN_EXPRESSION: "('Hello' = __RONIN_FIELD_stringConcat)",
    });

    // @ts-expect-error This exists
    expect(Test.fields[17].computedAs).toEqual({
      kind: 'VIRTUAL',
      value: {
        __RONIN_EXPRESSION: '(__RONIN_FIELD_numberAdd2 + __RONIN_FIELD_numberSubtract)',
      },
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
        stringAbs: string().defaultValue(() => abs(-42)),
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
      __RONIN_EXPRESSION: 'abs(-42)',
    });
    // @ts-expect-error This exists
    expect(Test.fields[2].defaultValue).toEqual({
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
  });
});
