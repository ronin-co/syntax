import { describe, expect, test } from 'bun:test';
import { link } from '@/src/index';
import {
  serializeFields,
  serializePresets,
  serializeQueries,
  serializeTriggers,
} from '@/src/model/utils/serializers';
import { add } from 'ronin';

describe('serializers', () => {
  test('serializeFields', () => {
    const fields = serializeFields({
      account: link({ model: { slug: 'account' } }),
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
    // @ts-expect-error: The queries need to be adjusted in the TS client.
    const query = serializeQueries(() => [add.account.to({ name: 'Lorena' })]);

    expect(query).toEqual([{ add: { account: { to: { name: 'Lorena' } } } }]);
  });
});
