import { describe, expect, test } from 'bun:test';
import { boolean } from '@/src/schema';

describe('boolean', () => {
  test('create field', () => {
    const field = boolean();

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'boolean',
      name: undefined,
    });
  });

  test('create field with attributes', () => {
    const field = boolean({ required: true, name: 'Registered' });

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'boolean',
      name: 'Registered',
      required: true,
    });
  });
});
