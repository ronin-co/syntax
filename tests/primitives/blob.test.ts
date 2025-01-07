import { describe, expect, test } from 'bun:test';
import { blob } from '@/src/schema';

describe('blob', () => {
  test('create field', () => {
    const field = blob();

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'blob',
      name: undefined,
    });
  });

  test('create field with attributes', () => {
    const field = blob({ required: true, name: 'Registered' });

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'blob',
      name: 'Registered',
      required: true,
    });
  });
});
