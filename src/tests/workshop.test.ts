import { faker } from "@faker-js/faker";

import { handler as createWorkShopHandler } from "@/endpoints/workshop/createWorkshopHandler";
import { eventMock } from "@/tests/eventMock";
import { mockedContext } from "@/tests/mockedContext";

import { authRandomUser } from "./testUtils/authRandomUser";

describe("create, get, update and delete workshop", () => {
  test("create workshop, except success", async () => {
    const jwtToken = await authRandomUser();
    const workshopBody = {
      start_at: faker.date.past().toISOString(),
      end_at: faker.date.future().toISOString(),
      participation_method: faker.vehicle.bicycle(),
    };
    console.log(jwtToken);

    const workshop = await createWorkShopHandler(
      eventMock(workshopBody, { Authorization: `Bearer ${jwtToken}` }),
      mockedContext,
    ).catch((err) => err);

    expect(workshop.statusCode).toBe(200);
    console.log(workshop.body);
  });
  test("create workshop with wrong credential, except error", async () => {});
  test("create workshop with wrong request properties, except error", async () => {});
  test("get workshop , except success", async () => {});
  test("get workshop with wrong uuid, except error", async () => {});
  test("get workshop list with 5 kinds of query parameter, except success", async () => {});
  test("get workshop list with incorrect query parameter", async () => {});
  test("update workshop, except success", async () => {});
  test("update workshop with wrong credential, except error", async () => {});
  test("update workshop with not existence workshop uuid, except error", async () => {});
  test("update workshop with token from another user rather than the host, except error", async () => {});
  test("update workshop with wrong request properties, except error", async () => {});
  test("delete workshop, except success", async () => {});
  test("delete workshop with wrong credential, except error", async () => {});
  test("delete workshop with wrong uuid, except error", async () => {});
  test("delete workshop with token from another user rather than the host, except error", async () => {});
  test("delete workshop with wrong request properties, except error", async () => {});
});
