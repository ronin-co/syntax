import { describe, expect, test } from 'bun:test';
import { type SyntaxItem, getProperty, getSyntaxProxy, setProperty } from '@/src/queries';
import { type FieldOutput, link } from '@/src/schema';
import {
  serializeFields,
  serializePresets,
  serializeQueries,
  serializeTriggers,
} from '@/src/utils/serializers';

describe('serializers', () => {
  test('serializeFields', () => {
    const fields = serializeFields({
      account: link({ target: 'account' }) as unknown as SyntaxItem<FieldOutput<'link'>>,
    });

    expect(fields).toEqual([
      {
        slug: 'account',
        target: 'account',
        type: 'link',
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

describe('miscellaneous', () => {
  test('getProperty', () => {
    const contents = {
      item: true,
    };

    expect(getProperty(contents, 'item')).toBe(true);
  });

  test('setPropertyProperty', () => {
    const contents = {
      item: true,
    };

    setProperty(contents, 'item', false);

    expect(contents.item).toBe(false);
  });
});
