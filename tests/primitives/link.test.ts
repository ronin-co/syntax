import { describe, expect, test } from 'bun:test';
import { link } from '@/src/index';

describe('link', () => {
  test('create field', () => {
    const field = link({
      model: { slug: 'account' },
    });
    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'link',
      actions: undefined,
      name: undefined,
      model: { slug: 'account' },
    });
  });

  test('create field with attributes', () => {
    const field = link({
      model: { slug: 'account' },
      required: true,
      name: 'Profile',
    });
    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'link',
      model: { slug: 'account' },
      name: 'Profile',
      actions: undefined,
      required: true,
    });
  });
});
