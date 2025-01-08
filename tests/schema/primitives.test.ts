import { expect, test } from 'bun:test';
import type { SyntaxItem } from '@/src/queries';
import {
  type FieldOutput,
  blob,
  boolean,
  date,
  json,
  link,
  number,
  string,
} from '@/src/schema';

test('create string field', () => {
  const field = string({ displayAs: 'secret' }) as unknown as SyntaxItem<
    FieldOutput<'string'>
  >;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'string',
    name: undefined,
    displayAs: 'secret',
  });
});

test('create string field with attributes', () => {
  const field = string({ required: true, name: 'Surname' }) as unknown as SyntaxItem<
    FieldOutput<'string'>
  >;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'string',
    name: 'Surname',
    required: true,
  });
});

test('create number field', () => {
  const field = number() as unknown as SyntaxItem<FieldOutput<'number'>>;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'number',
    name: undefined,
  });
});

test('create number field with attributes', () => {
  const field = number({ required: true, name: 'Follower' }) as unknown as SyntaxItem<
    FieldOutput<'number'>
  >;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'number',
    name: 'Follower',
    required: true,
  });
});

test('create boolean field', () => {
  const field = boolean() as unknown as SyntaxItem<FieldOutput<'boolean'>>;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'boolean',
    name: undefined,
  });
});

test('create boolean field with attributes', () => {
  const field = boolean({ required: true, name: 'Registered' }) as unknown as SyntaxItem<
    FieldOutput<'boolean'>
  >;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'boolean',
    name: 'Registered',
    required: true,
  });
});

test('create date field', () => {
  const field = date() as unknown as SyntaxItem<FieldOutput<'date'>>;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'date',
    name: undefined,
  });
});

test('create date field with attributes', () => {
  const field = date({ required: true, name: 'Registered' }) as unknown as SyntaxItem<
    FieldOutput<'date'>
  >;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'date',
    name: 'Registered',
    required: true,
  });
});

test('create blob field', () => {
  const field = blob() as unknown as SyntaxItem<FieldOutput<'blob'>>;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'blob',
    name: undefined,
  });
});

test('create blob field with attributes', () => {
  const field = blob({ required: true, name: 'Registered' }) as unknown as SyntaxItem<
    FieldOutput<'blob'>
  >;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'blob',
    name: 'Registered',
    required: true,
  });
});

test('create json field', () => {
  const field = json() as unknown as SyntaxItem<FieldOutput<'json'>>;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'json',
    name: undefined,
    displayAs: undefined,
  });
});

test('create json field with attributes', () => {
  const field = json({ required: true, name: 'Registered' }) as unknown as SyntaxItem<
    FieldOutput<'json'>
  >;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'json',
    name: 'Registered',
    displayAs: undefined,
    required: true,
  });
});

test('create link field', () => {
  const field = link({
    target: 'account',
  }) as unknown as SyntaxItem<FieldOutput<'link'>>;

  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'link',
    actions: undefined,
    name: undefined,
    target: 'account',
  });
});

test('create link field with attributes', () => {
  const field = link({
    target: 'account',
    required: true,
    name: 'Profile',
  }) as unknown as SyntaxItem<FieldOutput<'link'>>;
  expect(field.structure).toBeTypeOf('object');

  expect(field.structure).toEqual({
    type: 'link',
    target: 'account',
    name: 'Profile',
    actions: undefined,
    required: true,
  });
});
