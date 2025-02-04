import { expect, spyOn, test } from 'bun:test';
import { getBatchProxySQL, getSyntaxProxySQL } from '@/src/queries';
import type { Statement } from '@ronin/compiler';

test('using raw SQL', async () => {
  let statement: Statement | undefined;

  const sqlProxy = getSyntaxProxySQL({
    callback: (value) => {
      statement = value;
    },
  });

  const accountHandle = 'elaine';
  sqlProxy`SELECT * FROM accounts WHERE handle = ${accountHandle}`;

  expect(statement).toMatchObject({
    statement: 'SELECT * FROM accounts WHERE handle = $1',
    params: ['elaine'],
  });
});

test('using raw SQL in batch', async () => {
  const statementHandler = { callback: () => undefined };
  const statementHandlerSpy = spyOn(statementHandler, 'callback');

  const sqlProxy = getSyntaxProxySQL({
    callback: statementHandlerSpy,
  });

  const accountHandle = 'elaine';

  const batchProxy = getBatchProxySQL(() => [
    sqlProxy`SELECT * FROM accounts WHERE handle = ${accountHandle}`,
  ]);

  expect(batchProxy).toMatchObject([
    {
      statement: 'SELECT * FROM accounts WHERE handle = $1',
      params: ['elaine'],
    },
  ]);

  expect(statementHandlerSpy).not.toHaveBeenCalled();
});
