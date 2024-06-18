import { PARAMETER_OF_WORKSHOP_LIST_QUERY } from "@/constants/constants";
import { middyWrapper } from "@/middleware/middy/middyWrapper";
import { listWorkshopDetailsSchema } from "@/models/schemas";
import { listWorkshops } from "@/services/db/workshop/listWorkshops";

export async function lambdaHandler(request) {
  const status =
    request.queryStringParameters[PARAMETER_OF_WORKSHOP_LIST_QUERY];
  const result = await listWorkshops(status);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middyWrapper({lambdaHandler, schema: listWorkshopDetailsSchema, parseBody : false, requireAuth: false});