module.exports = function (options) {
  return {
    root: {
      dependencies: [],
      devDependencies: [
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
      ],
    },
  };
}
