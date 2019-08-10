//The first plugin helps us to resolve packages using Node’s resolve strategy.
//And the second one will help us to minify the output.
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

function config({ output = {}, plugins = [] }) {
  return [
    {
      input: "build/index.js",
      output: {
        file: "www/js/damonster/bundle.js",
        format: "iife",
        name: "damonster",
        ...output
      },
      plugins: [resolve(), typescript(), ...plugins]
    },
    {
      input: "build/component/index.js",
      output: {
        file: "www/js/damonster/web-components.js",
        format: "es"
      }
    }
  ];
}

const devBuild = {
  output: { sourcemap: true }
};
const prodBuild = {
  plugins: [terser()]
};

const build = process.env.BUILD === 'production' ? prodBuild : devBuild;

export default config(build)