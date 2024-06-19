import type { JestConfigWithTsJest } from "ts-jest";

export default async (): Promise<JestConfigWithTsJest> => {
  const esModules = ["@middy", "ajv-ftl-i18n", "fluent-transpiler"].join("|");
  return {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    transformIgnorePatterns: [`/node_modules/(?!${esModules}/)`],
    transform: {
      "^.+.(j|t)sx?$": "ts-jest",
    },
    moduleNameMapper: {
      "^(@[^/].*)$": "<rootDir>/node_modules/$1",
      "^@/userHandler/(.*)$": "<rootDir>/src/endpoints/user/$1",
      "^@/(.*)$": "<rootDir>/src/$1",
    },
  };
};
