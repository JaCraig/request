import typescript from '@rollup/plugin-typescript';
import terser from "@rollup/plugin-terser";

export default [
  {
    input: 'src/Request.ts',
    output: [
      {
        file: 'lib/Request.cjs.js', // CommonJS format for Node.js
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
        globals: {
          "@jacraig/woodchuck": "woodchuck"
        }
      },
      {
        file: 'lib/Request.esm.js', // ES module format for modern browsers and bundlers
        format: 'esm',
        sourcemap: true,
        globals: {
          "@jacraig/woodchuck": "woodchuck"
        }
      },
    ],
    external: ['@jacraig/woodchuck'],
    plugins: [typescript({
      declaration: true,
      declarationDir: 'lib'
    })],
  },
  {
    input: 'src/Request.ts',
    output: {
      file: 'lib/Request.umd.js', // UMD format for browser global usage
      format: 'umd',
      name: 'request', // Global variable name
      exports: 'named',
      sourcemap: true,
      globals: {
        "@jacraig/woodchuck": "woodchuck"
      }
    },
    external: ['@jacraig/woodchuck'],
    plugins: [typescript({
      declaration: true,
      declarationDir: 'lib'
    })],
  },
  {
    input: 'src/Request.ts',
    output: {
      file: 'lib/Request.umd.min.js', // UMD format for browser global usage
      format: 'umd',
      name: 'request', // Global variable name
      exports: 'named',
      sourcemap: true,
      globals: {
        "@jacraig/woodchuck": "woodchuck"
      }
    },
    external: ['@jacraig/woodchuck'],
    plugins: [typescript({
      declaration: true,
      declarationDir: 'lib'
    }),terser()],
  },
];
