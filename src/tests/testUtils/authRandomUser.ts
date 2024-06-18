import { faker } from "@faker-js/faker";

import { eventMock } from "@/tests/eventMock";
import { mockedContext } from "@/tests/mockedContext";
import { handler as authUserHandler } from "@/userHandler/authUserHandler";
import { handler as createUserHandler } from "@/userHandler/createUserHandler";

export async function authRandomUser() {
  const [name, email, password] = [
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
  const userBody = {
    name,
    email,
    password,
  };

  const user = await createUserHandler(
    eventMock(userBody),
    mockedContext,
  ).catch((err) => err);
  console.log(user);

  const authBody = {
    email,
    password,
  };
  const auth = await authUserHandler(eventMock(authBody), mockedContext).catch(
    (err) => err,
  );

  console.log(auth);

  return JSON.parse(auth.body).JWT;
}
