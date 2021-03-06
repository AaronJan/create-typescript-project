module.exports = function (options) {
  return {
    root: {
      dependencies: [],
      devDependencies: [
        "lerna",
        "@types/jest",
        "@types/node",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "eslint",
        "jest",
        "prettier",
        "rimraf",
        "ts-jest",
        "ts-node",
        "typescript"
      ]
    },
    packages: {
      dependencies: [],
      devDependencies: [
        "@types/jest",
        "@types/node",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "eslint",
        "eslint-plugin-import",
        "eslint-plugin-node",
        "eslint-plugin-promise",
        "eslint-plugin-standard",
        "eslint-config-prettier",
        "jest",
        "prettier",
        "rimraf",
        "ts-jest",
        "ts-node",
        "typescript"
      ]
    },
  };
}
