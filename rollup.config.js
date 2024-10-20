import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import css from "rollup-plugin-import-css";

export default {
  input: "src/applause-button.js",
  plugins: [
    resolve(),
    replace({
      values: {
        __VERSION: process.env.npm_package_version,
      },
      preventAssignment: true,
    }),
    css({ minify: true, output: "applause-button.css" }),
    babel({
      presets: [["@babel/preset-env"]],
      babelHelpers: "bundled",
    }),
    terser(),
  ],
  output: {
    file: "dist/applause-button.js",
    format: "umd",
  },
};
