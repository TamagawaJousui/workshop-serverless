export const eventMock = (body, headers?) => ({
  body: JSON.stringify(body),
  path: "/users/auth",
  httpMethod: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  multiValueHeaders: null,
  isBase64Encoded: false,
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  requestContext: null,
  resource: "",
  stageVariables: null,
});
