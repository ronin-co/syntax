import { describe, expect, test } from 'bun:test';
import { json } from '@/src/schema';

describe('json', () => {
  test('create field', () => {
    const field = json();

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'json',
      name: undefined,
      displayAs: undefined,
    });
  });

  test('create field with attributes', () => {
    const field = json({ required: true, name: 'Registered' });

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'json',
      name: 'Registered',
      displayAs: undefined,
      required: true,
    });
  });
});
