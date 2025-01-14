import { describe, expect, test } from 'bun:test';
import { model, string } from '@/src/schema';
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
        test: string().defaultValue(sql("UPPER('test')")),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: "UPPER('test')",
    });
  });
  test('operator string expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(op('Hello', '||', 'World')),
      },
    });

    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: "'Hello' || 'World'",
    });
  });

  test('operator number expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(op(1, '-', 2)),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: '1 - 2',
    });
  });

  test('random expression', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(random()),
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
        test: string().defaultValue(abs(-42)),
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
        test: string().defaultValue(strftime('%Y-%m-%d', 'now')),
      },
    });
    expect(Test).toBeTypeOf('object');
  });

  test('nested expressions', () => {
    const Test = model({
      slug: 'test',
      fields: {
        test: string().defaultValue(op(random(), '+', 2)),
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
        test: string().defaultValue(json_patch('{"op": "add"}', '{"foo": "bar"}')),
        test2: string().defaultValue(json_set('{"foo": "bar"}', '$.foo', '"baz"')),
        test3: string().defaultValue(json_replace('{"foo": "bar"}', '$.foo', '"baz"')),
        test4: string().defaultValue(json_insert('{"foo": "bar"}', '$.baz', '"qux"')),
      },
    });
    expect(Test).toBeTypeOf('object');
    // @ts-expect-error This exists
    expect(Test.fields[0].defaultValue).toEqual({
      __RONIN_EXPRESSION: 'json_patch(\'{"op": "add"}\', \'{"foo": "bar"}\')',
    });
  });
});
