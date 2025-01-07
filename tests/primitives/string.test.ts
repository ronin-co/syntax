import { describe, expect, test } from 'bun:test';
import { string } from '@/src/schema/index';

describe('string', () => {
  test('create field', () => {
    const field = string({ displayAs: 'secret' });

    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'string',
      name: undefined,
      displayAs: 'secret',
    });
  });

  test('create field with attributes', () => {
    const field = string({ required: true, name: 'Surname' });

    expect(field).toBeTypeOf('object');

    expect(field).toEqual({
      type: 'string',
      name: 'Surname',
      displayAs: 'single-line',
      required: true,
    });
  });
});
