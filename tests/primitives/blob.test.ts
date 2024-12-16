import { describe, expect, test } from 'bun:test';
import { blob } from '@/src/index';

describe('blob', () => {
  test('create field', () => {
    const field = blob();

    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'blob',
      name: undefined,
    });
  });

  test('create field with attributes', () => {
    const field = blob({ required: true, name: 'Registered' });

    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'blob',
      name: 'Registered',
      required: true,
    });
  });
});
