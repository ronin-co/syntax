import { describe, expect, test } from 'bun:test';
import { getSyntaxProxy } from '@/src/queries';
import { link } from '@/src/schema';
import {
  serializeFields,
  serializePresets,
  serializeQueries,
  serializeTriggers,
} from '@/src/utils/serializers';

describe('serializers', () => {
  test('serializeFields', () => {
    const fields = serializeFields({
      account: link({ target: 'account' }),
    });

    expect(fields).toEqual([
      {
        actions: undefined,
        defaultValue: undefined,
        required: false,
        slug: 'account',
        name: undefined,
        target: 'account',
        type: 'link',
        unique: false,
      },
    ]);

    // Test empty fields case
    expect(serializeFields()).toEqual([]);
  });

  test('serializePresets', () => {
    const preset = serializePresets({
      test: {
        with: {
          space: {
            being: 'spa_m9h8oha94helaji',
          },
        },
        selecting: ['name'],
      },
    });

    expect(preset).toStrictEqual([
      {
        slug: 'test',
        instructions: {
          with: {
            space: {
              being: 'spa_m9h8oha94helaji',
            },
          },
          selecting: ['name'],
        },
      },
    ]);
  });

  test('serializeTriggers', () => {
    const add = getSyntaxProxy({ rootProperty: 'add' });

    const triggers = serializeTriggers([
      {
        action: 'INSERT',
        when: 'AFTER',
        fields: [{ slug: 'name' }],
        // @ts-expect-error: The queries need to be adjusted in the TS client.
        effects: () => [add.account.to({ name: 'Lorena' })],
      },
    ]);

    expect(triggers).toEqual([
      {
        action: 'INSERT',
        when: 'AFTER',
        effects: [
          {
            add: {
              account: {
                to: {
                  name: 'Lorena',
                },
              },
            },
          },
        ],
        fields: [{ slug: 'name' }],
      },
    ]);
  });

  test('serialize empty triggers', () => {
    const triggers = serializeTriggers();
    // @ts-expect-error: Triggers can be undefined.
    expect(triggers).toStrictEqual(undefined);
  });

  test('serialize query', () => {
    const add = getSyntaxProxy({ rootProperty: 'add' });

    const query = serializeQueries(() => [add.account.to({ name: 'Lorena' })]);

    expect(query).toEqual([{ add: { account: { to: { name: 'Lorena' } } } }]);
  });
});
