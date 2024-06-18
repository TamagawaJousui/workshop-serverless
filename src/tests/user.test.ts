import { faker } from "@faker-js/faker";

import { isUuidV4 } from "@/authUtils/jwtUtil";
import {
  USER_AUTHENTICATION_FAILED_ERROR_MESSAGE,
  USER_EMAIL_DUPLICATED_ERROR_MESSAGE,
} from "@/constants/errorMessages";
import { handler as authUserHandler } from "@/userHandler/authUserHandler";
import { handler as createUserHandler } from "@/userHandler/createUserHandler";

import { eventMock } from "./eventMock";
import { mockedContext } from "./mockedContext";

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

    const result = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({ "Content-Type": "application/json" });
    result.body = JSON.parse(result.body);
    expect(isUuidV4(result.body.id)).toBeTruthy;
    expect(result.body.name).toBe(name);
    expect(result.body.email).toBe(email);
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

    const first = await createUserHandler(eventMock(body), mockedContext).catch(
      (err) => err,
    );

    expect(first.statusCode).toBe(200);
    expect(first.headers).toEqual({ "Content-Type": "application/json" });
    first.body = JSON.parse(first.body);
    expect(isUuidV4(first.body.id)).toBeTruthy;
    expect(first.body.name).toBe(name);
    expect(first.body.email).toBe(email);

    body.name = faker.internet.userName();
    body.password = faker.internet.password();

    const second = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);
    expect(second.statusCode).toBe(400);
    expect(second.headers).toEqual({ "Content-Type": "text/plain" });
    expect(second.body).toBe(USER_EMAIL_DUPLICATED_ERROR_MESSAGE);
  });
  test("register user with insufficient properties, except error", async () => {
    const [name, email] = [faker.internet.userName(), faker.internet.email()];
    const body = {
      name,
      email,
    };

    const result = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);

    expect(result.statusCode).toBe(400);
    expect(result.headers).toEqual({ "Content-Type": "text/plain" });
    expect(result.body).toBe("Event object failed validation");
  });
  test("register user with extra properties, except error", async () => {
    const [name, email, password, extra] = [
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
      faker.animal.bird(),
    ];
    const body = {
      name,
      email,
      password,
      extra,
    };

    const result = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);

    expect(result.statusCode).toBe(400);
    expect(result.headers).toEqual({ "Content-Type": "text/plain" });
    expect(result.body).toBe("Event object failed validation");
  });
  test("register user with wrong email format, except error", async () => {
    const [name, email, password] = [
      faker.internet.userName(),
      faker.internet.userName(),
      faker.internet.password(),
    ];
    const body = {
      name,
      email,
      password,
    };

    const result = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);
    expect(result.statusCode).toBe(400);
    expect(result.headers).toEqual({ "Content-Type": "text/plain" });
    expect(result.body).toBe("Event object failed validation");
  });

  test("register user then auth, except success", async () => {
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

    const register = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);

    expect(register.statusCode).toBe(200);
    expect(register.headers).toEqual({ "Content-Type": "application/json" });
    register.body = JSON.parse(register.body);
    expect(isUuidV4(register.body.id)).toBeTruthy;
    expect(register.body.name).toBe(name);
    expect(register.body.email).toBe(email);

    const auth = await authUserHandler(
      eventMock({ email, password }),
      mockedContext,
    );

    expect(auth.statusCode).toBe(200);
    expect(auth.headers).toEqual({ "Content-Type": "application/json" });
    auth.body = JSON.parse(auth.body);
    expect(auth.body.JWT).toBeDefined;
  });
  test("register user the auth with insufficient properties, except error", async () => {
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

    const register = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);

    expect(register.statusCode).toBe(200);
    expect(register.headers).toEqual({ "Content-Type": "application/json" });
    register.body = JSON.parse(register.body);
    expect(isUuidV4(register.body.id)).toBeTruthy;
    expect(register.body.name).toBe(name);
    expect(register.body.email).toBe(email);

    const auth = await authUserHandler(eventMock({ email }), mockedContext);

    expect(auth.statusCode).toBe(400);
    expect(auth.headers).toEqual({ "Content-Type": "text/plain" });
    expect(auth.body).toBe("Event object failed validation");
  });
  test("register user with extra properties, except error", async () => {
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

    const register = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);

    expect(register.statusCode).toBe(200);
    expect(register.headers).toEqual({ "Content-Type": "application/json" });
    register.body = JSON.parse(register.body);
    expect(isUuidV4(register.body.id)).toBeTruthy;
    expect(register.body.name).toBe(name);
    expect(register.body.email).toBe(email);

    const extra = faker.animal.bird();
    const auth = await authUserHandler(
      eventMock({ email, password, extra }),
      mockedContext,
    );

    expect(auth.statusCode).toBe(400);
    expect(auth.headers).toEqual({ "Content-Type": "text/plain" });
    expect(auth.body).toBe("Event object failed validation");
  });
  test("register user then auth with wrong name or password, except error", async () => {
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

    const register = await createUserHandler(
      eventMock(body),
      mockedContext,
    ).catch((err) => err);

    expect(register.statusCode).toBe(200);
    expect(register.headers).toEqual({ "Content-Type": "application/json" });
    register.body = JSON.parse(register.body);
    expect(isUuidV4(register.body.id)).toBeTruthy;
    expect(register.body.name).toBe(name);
    expect(register.body.email).toBe(email);

    const authWrongPassword = await authUserHandler(
      eventMock({ email, password: faker.internet.password() }),
      mockedContext,
    );

    expect(authWrongPassword.statusCode).toBe(400);
    expect(authWrongPassword.headers).toEqual({ "Content-Type": "text/plain" });
    expect(authWrongPassword.body).toBe(
      USER_AUTHENTICATION_FAILED_ERROR_MESSAGE,
    );

    const authWrongEmail = await authUserHandler(
      eventMock({ email: faker.internet.email(), password }),
      mockedContext,
    );

    expect(authWrongEmail.statusCode).toBe(400);
    expect(authWrongEmail.headers).toEqual({ "Content-Type": "text/plain" });
    expect(authWrongEmail.body).toBe(USER_AUTHENTICATION_FAILED_ERROR_MESSAGE);
  });
});
