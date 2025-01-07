# RONIN Schema

[![tests](https://img.shields.io/github/actions/workflow/status/ronin-co/schema/validate.yml?label=tests)](https://github.com/ronin-co/schema/actions/workflows/validate.yml)
[![code coverage](https://img.shields.io/codecov/c/github/ronin-co/schema)](https://codecov.io/github/ronin-co/schema)
[![install size](https://packagephobia.com/badge?p=@ronin/syntax)](https://packagephobia.com/result?p=@ronin/syntax)

This package provides all primitives necessary for defining a [RONIN database schema](https://ronin.co/docs/platform/schemas-in-code) in code.

## Setup

You don't need to install this package explicitly, as it is already included in the [RONIN client](https://github.com/ronin-co/client).

However, we would be excited to welcome your feature suggestions or bug fixes for the RONIN schema. Read on to learn more about how to suggest changes.

## Contributing

To start contributing code, first make sure you have [Bun](https://bun.sh) installed, which is a JavaScript runtime.

Next, [clone the repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) and install its dependencies:

```bash
bun install
```

Once that's done, link the package to make it available to all of your local projects:

```bash
bun link
```

Inside your project, you can then run the following command, which is similar to `bun add @ronin/syntax` or `npm install @ronin/syntax`, except that it doesn't install `@ronin/syntax` from npm, but instead uses your local clone of the package:

```bash
bun link @ronin/syntax
```

If your project is not yet compatible with [Bun](https://bun.sh), feel free to replace all of the occurrences of the word `bun` in the commands above with `npm` instead.

You will just need to make sure that, once you [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request#creating-the-pull-request) on the current repo, it will not contain a `package-lock.json` file, which is usually generated by npm. Instead, we're using the `bun.lockb` file for this purpose (locking sub dependencies to a certain version).

### Transpilation

In order to be compatible with a wide range of projects, the source code of the `schema` repo needs to be compiled (transpiled) whenever you make changes to it. To automate this, you can keep this command running in your terminal:

```bash
bun run dev
```

Whenever you make a change to the source code, it will then automatically be transpiled again.

### Running Tests

The RONIN schema has 100% test coverage, which means that every single line of code is tested automatically, to ensure that any change to the source code doesn't cause a regression.

Before you create a pull request on the `schema` repo, it is therefore advised to run those tests in order to ensure everything works as expected:

```bash
# Run all tests
bun test

# Alternatively, run a single test
bun test -t 'your test name'
```