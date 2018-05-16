import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "src/applause-button.js",
  plugins: [
    resolve(),
    babel({
      presets: [
        [
          "env",
          {
            modules: false
          }
        ]
      ],
      plugins: ["external-helpers"]
    }),
    uglify()
  ],
  output: {
    file: "dist/applause-button.js",
    format: "umd"
  }
};
