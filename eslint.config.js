module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["coverage/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        URL: "readonly",
        console: "readonly",
        fetch: "readonly",
        module: "readonly",
        process: "readonly",
        require: "readonly",
        setTimeout: "readonly",
      },
      sourceType: "commonjs",
    },
    rules: {
      curly: ["error", "all"],
      eqeqeq: "error",
      "no-constant-condition": "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
    },
  },
];
