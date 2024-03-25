module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: ["standard-with-typescript", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "tsconfig.json",
  },
  plugins: ["simple-import-sort"],
  rules: {
    // prettier
    "prettier/prettier": ["error", { printWidth: 120 }],
    // typescript
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
    "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "separate-type-imports" }],
    "@typescript-eslint/consistent-type-exports": ["error", { fixMixedExportsWithInlineTypeSpecifier: false }],
    // simple-import-sort
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
  },
  overrides: [
    {
      files: [".eslintrc.js"],
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
      parserOptions: {
        sourceType: "module",
      },
    },
  ],
  ignorePatterns: ["dist"],
};
