import { faker } from "@faker-js/faker";

import { isUuidV4 } from "@/authUtils/jwtUtil";
import { handler } from "@/userHandler/createUserHandler";
import { USER_EMAIL_DUPLICATED_ERROR_MESSAGE } from "@/constants/errorMessages";

const eventMock = (body) => ({
  body: JSON.stringify(body),
  path: "/users/auth",
  httpMethod: "POST",
  headers: { "Content-Type": "application/json" },
  multiValueHeaders: null,
  isBase64Encoded: false,
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  requestContext: null,
  resource: "",
  stageVariables: null,
});

const mockedContext = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "mocked",
  functionVersion: "mocked",
  invokedFunctionArn: "mocked",
  memoryLimitInMB: "mocked",
  awsRequestId: "mocked",
  logGroupName: "mocked",
  logStreamName: "mocked",
  getRemainingTimeInMillis(): number {
    return 999;
  },
  done(): void {
    return;
  },
  fail(): void {
    return;
  },
  succeed(): void {
    return;
  },
};

describe("register and auth user", () => {
  test("register user, except success", async () => {
    const [name, email, password] = [
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
    const body = {
      name,
      email,
      password,
    };

    const result = await handler(eventMock(body), mockedContext).catch(
      (err) => err,
    );
    result.body = JSON.parse(result.body);
    expect(result.statusCode).toBe(200);
    expect(isUuidV4(result.body.id)).toBeTruthy;
    expect(result.body.name).toBe(name);
    expect(result.body.email).toBe(email);
    expect(result.headers).toEqual({ "Content-Type": "application/json" });
  });
  test("register user with duplicated email, except error", async () => {
    const [name, email, password] = [
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
    const body = {
      name,
      email,
      password,
    };

    const first = await handler(eventMock(body), mockedContext).catch(
      (err) => err,
    );

    first.body = JSON.parse(first.body);
    expect(first.statusCode).toBe(200);
    expect(isUuidV4(first.body.id)).toBeTruthy;
    expect(first.body.name).toBe(name);
    expect(first.body.email).toBe(email);
    expect(first.headers).toEqual({ "Content-Type": "application/json" });

    body.name = faker.internet.userName();
    body.password = faker.internet.password();

    const second = await handler(eventMock(body), mockedContext).catch(
      (err) => err,
    );
    console.log(second);
    expect(second.statusCode).toBe(400);
    expect(second.body).toBe(USER_EMAIL_DUPLICATED_ERROR_MESSAGE);
    expect(second.headers).toEqual({ "Content-Type": "text/plain" });
  });
});
