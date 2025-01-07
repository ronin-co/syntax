import { describe, expect, test } from 'bun:test';
import { date } from '@/src/schema';

describe('date', () => {
  test('create field', () => {
    const field = date();

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'date',
      name: undefined,
    });
  });

  test('create field with attributes', () => {
    const field = date({ required: true, name: 'Registered' });

    expect(field.structure).toBeTypeOf('object');

    expect(field.structure).toEqual({
      type: 'date',
      name: 'Registered',
      required: true,
    });
  });
});
