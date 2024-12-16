import { describe, expect, test } from 'bun:test';
import { slugToName } from '@/src/model/utils/formatter';

describe('formatter', () => {
  test('convert slug to name', () => {
    const slug = 'activeAt';
    const name = slugToName(slug);

    expect(name).toBeTypeOf('string');
    expect(name).toEqual('Active At');
  });

  test('convert slug to name with multiple cases', () => {
    const slug = 'activeAtFromLocation';
    const name = slugToName(slug);

    expect(name).toBeTypeOf('string');
    expect(name).toEqual('Active at from Location');
  });
});
