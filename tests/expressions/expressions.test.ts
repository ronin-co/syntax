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

  test.only('leo please check this', () => {
    const Test = model({
      slug: 'test',
      fields: {
        /* test: string({
          defaultValue: () => op(random(), '+', 1),
        }),
        test2: number().defaultValue(() => op(random(), '+', 1)),
        test3: string().unique(), */
        test4: number().check((fields) => op(fields.test5, '=', 'test')),
        test5: string({
          check: (fields) => op(fields.test4, '=', 'test'),
        }),
        /*   test6: string().defaultValue(() => sql("UPPER('test')")), */
      },
    });
    console.log(JSON.stringify(Test, null, 2));

    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].check).toEqual({
      __RONIN_EXPRESSION: "__RONIN_FIELD_test5 = 'test'",
    });
  });
  test('operator string expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(() => 'Hello' + 'World'),
      },
    });

    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual('HelloWorld');
  });

  test('operator number expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: number().defaultValue(() => 1 - 2),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual(-1);
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
        test: number().defaultValue(() => abs(-42)),
        test2: string().defaultValue(() => abs(-42)),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'abs(-42)',
    });
  });

  test('strftime expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: date().defaultValue(() => strftime('%Y-%m-%d', 'now')),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: "strftime('%Y-%m-%d', 'now')",
    });
  });

  test('nested expressions', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: number().defaultValue(() => op(random(), '+', 2)),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'random() + 2',
    });
  });

  test('json expressions', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(() => json_patch('{"op": "add"}', '{"foo": "bar"}')),
        test2: string().defaultValue(() => json_set('{"foo": "bar"}', '$.foo', '"baz"')),
        test3: string().defaultValue(() =>
          json_replace('{"foo": "bar"}', '$.foo', '"baz"'),
        ),
        test4: string().defaultValue(() =>
          json_insert('{"foo": "bar"}', '$.baz', '"qux"'),
        ),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'json_patch(\'{"op": "add"}\', \'{"foo": "bar"}\')',
    });
    // @ts-expect-error This exists
    expect(Test.fields[1].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'json_set(\'{"foo": "bar"}\', \'$.foo\', \'"baz"\')',
    });
    // @ts-expect-error This exists
    expect(Test.fields[2].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'json_replace(\'{"foo": "bar"}\', \'$.foo\', \'"baz"\')',
    });
    // @ts-expect-error This exists
    expect(Test.fields[3].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'json_insert(\'{"foo": "bar"}\', \'$.baz\', \'"qux"\')',
    });
  });
});
