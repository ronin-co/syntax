import { describe, expect, spyOn, test } from 'bun:test';

import { getBatchProxy, getSyntaxProxy } from '@/src/queries';
import { string } from '@/src/schema';
import { QUERY_SYMBOLS } from '@ronin/compiler';

describe('syntax proxy', () => {
  test('using sub query', () => {
    const getQueryHandler = { callback: () => undefined };
    const getQueryHandlerSpy = spyOn(getQueryHandler, 'callback');
    const addQueryHandler = { callback: () => undefined };
    const addQueryHandlerSpy = spyOn(addQueryHandler, 'callback');

    const getProxy = getSyntaxProxy({
      rootProperty: 'get',
      callback: getQueryHandlerSpy,
    });
    const addProxy = getSyntaxProxy({
      rootProperty: 'add',
      callback: addQueryHandlerSpy,
    });

    addProxy.accounts.to(() => getProxy.oldAccounts());

    const finalQuery = {
      add: {
        accounts: {
          to: {
            __RONIN_QUERY: {
              get: { oldAccounts: {} },
            },
          },
        },
      },
    };

    expect(getQueryHandlerSpy).not.toHaveBeenCalled();
    expect(addQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });

  test('using field with expression', () => {
    const setQueryHandler = { callback: () => undefined };
    const setQueryHandlerSpy = spyOn(setQueryHandler, 'callback');

    const setProxy = getSyntaxProxy({
      rootProperty: 'set',
      callback: setQueryHandlerSpy,
    });

    setProxy.accounts.to.name(
      (f: Record<string, unknown>) => `${f.firstName} ${f.lastName}`,
    );

    const finalQuery = {
      set: {
        accounts: {
          to: {
            name: {
              [QUERY_SYMBOLS.EXPRESSION]: `${QUERY_SYMBOLS.FIELD}firstName || ' ' || ${QUERY_SYMBOLS.FIELD}lastName`,
            },
          },
        },
      },
    };

    expect(setQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });

  test('using field with date', () => {
    const setQueryHandler = { callback: () => undefined };
    const setQueryHandlerSpy = spyOn(setQueryHandler, 'callback');

    const setProxy = getSyntaxProxy({
      rootProperty: 'set',
      callback: setQueryHandlerSpy,
    });

    const date = new Date();

    setProxy.member({
      with: { id: '1234' },
      // The date must be passed directly here, without conversion.
      to: { activeAt: date },
    });

    const finalQuery = {
      set: {
        member: {
          with: { id: '1234' },
          to: { activeAt: date.toISOString() },
        },
      },
    };

    expect(setQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });

  test('using field with file', () => {
    const setQueryHandler = { callback: () => undefined };
    const setQueryHandlerSpy = spyOn(setQueryHandler, 'callback');

    /**
     * Determines whether the provided value is storable as a binary object, or not.
     *
     * @param value - The value to check.
     *
     * @returns A boolean indicating whether the provided value is storable, or not.
     */
    const isStorableObject = (value: unknown): boolean =>
      (typeof File !== 'undefined' && value instanceof File) ||
      (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream) ||
      (typeof Blob !== 'undefined' && value instanceof Blob) ||
      (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) ||
      (typeof Buffer !== 'undefined' && Buffer.isBuffer(value));

    const setProxy = getSyntaxProxy({
      rootProperty: 'set',
      callback: setQueryHandlerSpy,
      replacer: isStorableObject,
    });

    const file = new File(['test'], 'test.txt');

    setProxy.account({
      with: { id: '1234' },
      to: { avatar: file },
    });

    const finalQuery = {
      set: {
        account: {
          with: { id: '1234' },
          to: { avatar: file },
        },
      },
    };

    expect(setQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });

  // Since `name` is a native property of functions and queries contain function calls,
  // we have to explicitly assert whether it can be used as a field slug.
  test('using field with slug `name`', () => {
    const getQueryHandler = { callback: () => undefined };
    const getQueryHandlerSpy = spyOn(getQueryHandler, 'callback');

    const getProxy = getSyntaxProxy({
      rootProperty: 'get',
      callback: getQueryHandlerSpy,
    });

    getProxy.accounts.with.name('test');

    const finalQuery = {
      get: {
        accounts: {
          with: {
            name: 'test',
          },
        },
      },
    };

    expect(getQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });

  test('using multiple fields with expressions', () => {
    const setQueryHandler = { callback: () => undefined };
    const setQueryHandlerSpy = spyOn(setQueryHandler, 'callback');

    const setProxy = getSyntaxProxy({
      rootProperty: 'set',
      callback: setQueryHandlerSpy,
    });

    setProxy.accounts.to((f: Record<string, unknown>) => ({
      name: `${f.firstName} ${f.lastName}`,
      email: `${f.handle}@site.co`,
    }));

    const finalQuery = {
      set: {
        accounts: {
          to: {
            name: {
              [QUERY_SYMBOLS.EXPRESSION]: `${QUERY_SYMBOLS.FIELD}firstName || ' ' || ${QUERY_SYMBOLS.FIELD}lastName`,
            },
            email: {
              [QUERY_SYMBOLS.EXPRESSION]: `${QUERY_SYMBOLS.FIELD}handle || '@site.co'`,
            },
          },
        },
      },
    };

    expect(setQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });

  test('using async context', () => {
    const get = getSyntaxProxy({ rootProperty: 'get' });

    const queries = getBatchProxy(() => [get.account()]);

    expect(queries.length === 1 ? { result: true } : null).toMatchObject({
      result: true,
    });
  });

  test('using options for query in batch', () => {
    const get = getSyntaxProxy({ rootProperty: 'get' });

    const queryList = getBatchProxy(() => [
      get.account(
        {
          with: { handle: 'juri' },
        },
        { randomOption: true },
      ),
    ]);

    expect(queryList).toEqual([
      {
        structure: {
          get: {
            account: {
              with: {
                handle: 'juri',
              },
            },
          },
        },
        options: {
          randomOption: true,
        },
      },
    ]);
  });

  test('using function chaining in batch', () => {
    const getProxy = getSyntaxProxy({ rootProperty: 'get', callback: () => undefined });

    const queryList = getBatchProxy(() => [
      // Test queries where the second function is called right after the first one.
      getProxy.members
        .with({ team: 'red' })
        // @ts-expect-error This will be improved shortly.
        .selecting(['name']),
      // Test queries where the second function is not called right after the first one.
      getProxy.members
        .with({ team: 'blue' })
        // @ts-expect-error This will be improved shortly.
        .orderedBy.ascending(['joinedAt']),
    ]);

    expect(queryList).toEqual([
      {
        structure: {
          get: {
            members: {
              with: {
                team: 'red',
              },
              selecting: ['name'],
            },
          },
        },
      },
      {
        structure: {
          get: {
            members: {
              with: {
                team: 'blue',
              },
              orderedBy: {
                ascending: ['joinedAt'],
              },
            },
          },
        },
      },
    ]);
  });

  test('using nested function as argument in batch', () => {
    // It's important to define the `callback` here, in order to guarantee that the
    // queries are executed standalone if no batch context is detected.
    const callback = () => undefined;

    const addProxy = getSyntaxProxy({ rootProperty: 'add', callback });
    const getProxy = getSyntaxProxy({ rootProperty: 'get', callback });
    const alterProxy = getSyntaxProxy({ rootProperty: 'alter', callback });

    const queryList = getBatchProxy(() => [
      addProxy.newUsers.to(() => getProxy.oldUsers()),
      // Assert whether function chaining is still possible after a nested function call,
      // since the latter is able to manipulate the batch context.
      alterProxy
        .model('newUsers')
        // @ts-expect-error This will be improved shortly
        .to({ slug: 'accounts' }),
    ]);

    expect(queryList).toEqual([
      {
        structure: {
          add: {
            newUsers: {
              to: {
                __RONIN_QUERY: {
                  get: { oldUsers: {} },
                },
              },
            },
          },
        },
      },
      {
        structure: {
          alter: {
            model: 'newUsers',
            to: {
              slug: 'accounts',
            },
          },
        },
      },
    ]);
  });

  test('using schema query types', () => {
    const callback = () => undefined;

    const createProxy = getSyntaxProxy({ rootProperty: 'create', callback });
    const alterProxy = getSyntaxProxy({ rootProperty: 'alter', callback });
    const dropProxy = getSyntaxProxy({ rootProperty: 'drop', callback });

    const queryList = getBatchProxy(() => [
      createProxy.model({
        slug: 'account',
      }),
      alterProxy
        .model('account')
        // @ts-expect-error This will be improved shortly.
        .to({
          slug: 'users',
        }),
      alterProxy
        .model('users')
        // @ts-expect-error This will be improved shortly.
        .create.field({
          slug: 'handle',
        }),
      alterProxy
        .model('users')
        // @ts-expect-error This will be improved shortly.
        .alter.field('handle')
        .to({
          name: 'User Handle',
        }),
      alterProxy
        .model('users')
        // @ts-expect-error This will be improved shortly
        .drop.field('handle'),
      dropProxy.model('users'),
    ]);

    expect(queryList).toEqual([
      {
        structure: {
          create: {
            model: {
              slug: 'account',
            },
          },
        },
      },
      {
        structure: {
          alter: {
            model: 'account',
            to: {
              slug: 'users',
            },
          },
        },
      },
      {
        structure: {
          alter: {
            create: {
              field: {
                slug: 'handle',
              },
            },
            model: 'users',
          },
        },
      },
      {
        structure: {
          alter: {
            alter: {
              field: 'handle',
              to: {
                name: 'User Handle',
              },
            },
            model: 'users',
          },
        },
      },
      {
        structure: {
          alter: {
            drop: {
              field: 'handle',
            },
            model: 'users',
          },
        },
      },
      {
        structure: {
          drop: {
            model: 'users',
          },
        },
      },
    ]);
  });

  test('using a function call at the root', () => {
    const getQueryHandler = { callback: () => undefined };
    const getQueryHandlerSpy = spyOn(getQueryHandler, 'callback');

    const getProxy = getSyntaxProxy({
      rootProperty: 'get',
      callback: getQueryHandlerSpy,
    });

    getProxy({ account: null });

    const finalQuery = {
      get: {
        account: null,
      },
    };

    expect(getQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });

  test('creating a model via query using primitive helpers', () => {
    const getQueryHandler = { callback: () => undefined };
    const getQueryHandlerSpy = spyOn(getQueryHandler, 'callback');

    const createProxy = getSyntaxProxy({
      rootProperty: 'create',
      callback: getQueryHandlerSpy,
    });

    createProxy.model({
      slug: 'account',

      fields: {
        handle: string().required() as any,
      },
    });

    const finalQuery = {
      create: {
        model: {
          slug: 'account',
          fields: [
            {
              type: 'string',
              slug: 'handle',
              required: true,
            },
          ],
        },
      },
    };

    expect(getQueryHandlerSpy).toHaveBeenCalledWith(finalQuery, undefined);
  });
});
