import { describe, expect, test } from 'bun:test';
import { string } from '@/src/schema';

describe('string', () => {
  test('create field', () => {
    const field = string({ displayAs: 'secret' });

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'string',
      name: undefined,
      displayAs: 'secret',
    });
  });

  test('create field with attributes', () => {
    const field = string({ required: true, name: 'Surname' });

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'string',
      name: 'Surname',
      required: true,
    });
  });
});
