//The first plugin helps us to resolve packages using Node’s resolve strategy.
//And the second one will help us to minify the output.
//import resolve from 'rollup-plugin-node-resolve';
//import {terser} from "rollup-plugin-terser";

export default [
  {
    input: "build/core/game.js",
    external: [
      //'idb/lib'
    ],
    output: {
      globals: {
        //'idb/lib': 'idb'
      },
      file: "www/js/damonster/bundle.js",
      format: "iife",
      name: "damonster"
    },
    plugins: [
      //resolve(),
      //terser(),
    ]
  },
  {
      input: "build/component/index.js",
      output:{
        format: "esm",
        file: "www/js/damonstr/web-components.js"
      }
  }
];
