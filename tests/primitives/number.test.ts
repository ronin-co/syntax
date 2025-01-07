import { describe, expect, test } from 'bun:test';
import { number } from '@/src/schema';

describe('number', () => {
  test('create field', () => {
    const field = number();

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'number',
      name: undefined,
    });
  });

  test('create field with attributes', () => {
    const field = number({ required: true, name: 'Follower' });

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'number',
      name: 'Follower',
      required: true,
    });
  });
});
