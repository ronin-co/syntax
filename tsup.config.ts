import { defineConfig } from 'tsup';

export default defineConfig(({ watch = false }) => ({
  clean: true,
  dts: {
    resolve: true,
  },
  format: 'esm',
  entry: {
    schema: 'src/schema/index.ts',
    queries: 'src/queries/index.ts',
  },
  watch,
}));
