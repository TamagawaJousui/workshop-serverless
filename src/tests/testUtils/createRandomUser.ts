import { faker } from "@faker-js/faker";

import { eventMock } from "@/tests/eventMock";
import { mockedContext } from "@/tests/mockedContext";
import { handler as createUserHandler } from "@/userHandler/createUserHandler";

export async function createRandomUser() {
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

  const result = await createUserHandler(eventMock(body), mockedContext).catch(
    (err) => err,
  );

  return { parameter: [name, email, password], result };
}
