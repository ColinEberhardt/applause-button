import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/applause-button.js",
  plugins: [
    resolve(),
    babel({
      presets: [
        [
          "@babel/preset-env"
        ]
      ],
      babelHelpers: "bundled",
    }),
    terser(),
  ],
  output: {
    file: "dist/applause-button.js",
    format: "umd",
  },
};
