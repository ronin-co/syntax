import { describe, expect, test } from 'bun:test';
import { getProperty, getSyntaxProxy, setProperty } from '@/src/queries';
import { type SyntaxField, link } from '@/src/schema';
import {
  serializeFields,
  serializePresets,
  serializeTriggers,
} from '@/src/utils/serializers';

describe('serializers', () => {
  test('serializeFields', () => {
    const fields = serializeFields({
      account: link({ target: 'account' }) as unknown as SyntaxField<'link'>,
    });

    expect(fields).toEqual([
      {
        slug: 'account',
        target: 'account',
        type: 'link',
      },
    ]);
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
