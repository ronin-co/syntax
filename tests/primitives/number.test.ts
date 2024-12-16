import { describe, expect, test } from 'bun:test';
import { number } from '@/src/index';

describe('number', () => {
  test('create field', () => {
    const field = number();

    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'number',
      name: undefined,
    });
  });

  test('create field with attributes', () => {
    const field = number({ required: true, name: 'Follower' });

    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'number',
      name: 'Follower',
      required: true,
    });
  });
});
