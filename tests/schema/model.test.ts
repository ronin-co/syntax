import { describe, expect, test } from 'bun:test';
import { getSyntaxProxy } from '@/src/queries';
import { blob, boolean, date, json, link, model, number, string } from '@/src/schema';
import { type GetQuery, QUERY_SYMBOLS } from '@ronin/compiler';

describe('models', () => {
  test('create empty model', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
    });

    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      // @ts-expect-error: The Account object has 'pluralSlug'.
      pluralSlug: 'accounts',
    });
  });

  test('create empty model with name', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      // @ts-expect-error: The Account object has 'pluralSlug'.
      pluralSlug: 'accounts',
      // @ts-expect-error: The Account object has 'name'.
      name: 'Account',
    });
  });

  test('create empty model with plural name', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      pluralName: 'Accounts',
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      // @ts-expect-error: The Account object has 'pluralSlug'.
      pluralSlug: 'accounts',
      // @ts-expect-error: The Account object has 'name'.
      name: 'Account',
      // @ts-expect-error: The Account object has 'pluralName'.
      pluralName: 'Accounts',
    });
  });

  test('create empty model without plural slug', () => {
    const Account = model({
      slug: 'account',
      name: 'Account',
      fields: {},
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      name: 'Account',
      fields: {},
    });
  });

  test('create empty model with name and plural name', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      pluralName: 'Accounts',
      fields: {},
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      pluralName: 'Accounts',
      fields: {},
    });
  });

  test('create empty model with identifier', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      identifiers: {
        name: 'Account',
        slug: 'account',
      },
      fields: {},
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      identifiers: {
        name: 'Account',
        slug: 'account',
      },
      fields: {},
    });
  });

  test('create empty model with id prefix', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
      idPrefix: 'acc_',
      fields: {},
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',
      idPrefix: 'acc_',
      fields: {},
    });
  });

  test('create simple model', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ required: true }),
      },
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: {
          type: 'string',
          required: true,
        },
      },
    });
  });

  test('create simple model with blob field', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ required: true }),
        avatar: blob(),
      },
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: {
          type: 'string',
          required: true,
        },
        avatar: {
          type: 'blob',
        },
      },
    });
  });

  test('create simple model with json field', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ required: true }),
        bio: json(),
      },
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: {
          type: 'string',
          required: true,
        },
        bio: {
          type: 'json',
        },
      },
    });
  });

  test('create simple model with date field', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ required: true }),
        birthday: date(),
      },
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: {
          type: 'string',
          required: true,
        },
        birthday: {
          type: 'date',
        },
      },
    });
  });

  test('create simple model with custom field name', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ required: true, name: 'CusToM NaMe' }),
      },
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: {
          name: 'CusToM NaMe',
          type: 'string',
          required: true,
        },
      },
    });
  });

  test('create simple model with field name inferred from slug', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        createdAt: string({ required: true }),
      },
    });
    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        createdAt: {
          type: 'string',
          required: true,
        },
      },
    });
  });

  test('create model with multiple fields', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ required: true }),
        email: string(),
        emailVerified: boolean(),
        password: string(),
        follower: number(),
      },
    });

    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
        },
        emailVerified: {
          type: 'boolean',
        },
        password: {
          type: 'string',
        },
        follower: {
          type: 'number',
        },
      },
    });
  });

  test('create model with unique field', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ unique: true }),
      },
    });

    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: {
          type: 'string',
          unique: true,
        },
      },
    });
  });

  test('create model with link field', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',

      fields: {
        name: string({ required: true }),
      },
    });

    const Post = model({
      slug: 'post',
      pluralSlug: 'posts',

      fields: {
        author: link({
          target: 'account',
          actions: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        }),
      },
    });

    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',
      fields: {
        name: {
          type: 'string',
          required: true,
        },
      },
    });

    expect(Post).toBeTypeOf('object');

    expect(Post).toEqual({
      // @ts-expect-error: The Post object has 'slug'.
      slug: 'post',
      pluralSlug: 'posts',

      fields: {
        author: {
          type: 'link',
          target: 'account',
          actions: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        },
      },
    });
  });

  test('create model with index', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      fields: {
        name: string({ required: true }),
      },
      indexes: {
        name: {
          fields: [{ slug: 'name', order: 'ASC', collation: 'BINARY' }],
        },
      },
    });
    expect(Account).toBeTypeOf('object');
    // @ts-expect-error: The Account object has 'fields'.
    expect(Object.keys(Account.fields)).toHaveLength(1);

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      fields: {
        name: {
          type: 'string',
          required: true,
        },
      },
      indexes: {
        name: {
          fields: [{ slug: 'name', order: 'ASC', collation: 'BINARY' }],
        },
      },
    });
  });

  test('create model with invalid index field', () => {
    try {
      model({
        slug: 'account',
        pluralSlug: 'accounts',
        name: 'Account',
        fields: {
          name: string({ required: true }),
        },
        indexes: {
          name: {
            fields: [
              // @ts-expect-error This is intended.
              { slug: 'thisFieldDoesNotExist', order: 'ASC', collation: 'BINARY' },
            ],
          },
        },
      });
    } catch (err) {
      const error = err as Error;
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        'The field thisFieldDoesNotExist does not exist in this model.',
      );
    }
  });

  test('create model with empty index field', () => {
    try {
      model({
        slug: 'account',
        pluralSlug: 'accounts',
        name: 'Account',
        fields: {
          name: string({ required: true }),
        },
        indexes: {
          name: {
            fields: [],
          },
        },
      });
    } catch (err) {
      const error = err as Error;
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('An index must have at least one field.');
    }
  });

  test('create model with triggers', () => {
    const add = getSyntaxProxy({ root: `${QUERY_SYMBOLS.QUERY}.add` });

    const Account = model(() => ({
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      fields: {
        name: string({ required: true }),
      },
      triggers: {
        afterInsert: {
          action: 'INSERT',
          when: 'AFTER',
          fields: [{ slug: 'name' }],
          // @ts-expect-error: The queries need to be adjusted in the TS client.
          effects: [add.account.with({ name: 'Lorena' })],
        },
      },
    }));

    expect(Account).toBeTypeOf('object');
    // @ts-expect-error: The Account object has 'fields'.
    expect(Object.keys(Account.fields)).toHaveLength(1);

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',
      name: 'Account',
      fields: {
        name: {
          type: 'string',
          required: true,
        },
      },
      triggers: {
        afterInsert: {
          action: 'INSERT',
          when: 'AFTER',
          effects: [
            {
              [QUERY_SYMBOLS.QUERY]: {
                add: {
                  account: {
                    with: {
                      name: 'Lorena',
                    },
                  },
                },
              },
            },
          ],
          fields: [{ slug: 'name' }],
        },
      },
    });
  });

  test('create model with presets', () => {
    const Account = model({
      slug: 'account',
      presets: {
        onlyName: {
          instructions: {
            with: {
              space: {
                being: 'spa_m9h8oha94helaji',
              },
            },
            selecting: ['name'],
          },
        },
      },
    });

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      presets: {
        onlyName: {
          instructions: {
            with: {
              space: {
                being: 'spa_m9h8oha94helaji',
              },
            },
            selecting: ['name'],
          },
        },
      },
    });
  });

  test('create model with presets including sub queries', () => {
    const getProxy = getSyntaxProxy<GetQuery>({ root: `${QUERY_SYMBOLS.QUERY}.get` });

    const Member = model({
      slug: 'member',
      fields: {
        account: string(),
      },
      presets: (f) => ({
        account: {
          instructions: {
            including: {
              // @ts-expect-error This will be improved shortly.
              account: getProxy.account.with.id(f.account),
            },
          },
        },
      }),
    });

    expect(Member).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'member',
      fields: {
        account: {
          type: 'string',
        },
      },
      presets: {
        account: {
          instructions: {
            including: {
              account: {
                [QUERY_SYMBOLS.QUERY]: {
                  get: {
                    account: {
                      with: {
                        id: {
                          [QUERY_SYMBOLS.EXPRESSION]: `${QUERY_SYMBOLS.FIELD}account`,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  test('create model with nested fields', () => {
    const Account = model({
      slug: 'account',
      pluralSlug: 'accounts',
      fields: {
        address: {
          country: string({ required: true }),
          city: string(),
        },
      },
    });

    expect(Account).toBeTypeOf('object');

    expect(Account).toEqual({
      // @ts-expect-error: The Account object has 'slug'.
      slug: 'account',
      pluralSlug: 'accounts',
      fields: {
        address: {
          country: {
            type: 'string',
            required: true,
          },
          city: {
            type: 'string',
          },
        },
      },
    });
  });
});
