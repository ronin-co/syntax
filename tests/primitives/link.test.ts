import { describe, expect, test } from 'bun:test';
import { link } from '@/src/schema';

describe('link', () => {
  test('create field', () => {
    const field = link({
      target: 'account',
    });
    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'link',
      actions: undefined,
      name: undefined,
      target: 'account',
    });
  });

  test('create field with attributes', () => {
    const field = link({
      target: 'account',
      required: true,
      name: 'Profile',
    });
    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'link',
      target: 'account',
      name: 'Profile',
      actions: undefined,
      required: true,
    });
  });
});
