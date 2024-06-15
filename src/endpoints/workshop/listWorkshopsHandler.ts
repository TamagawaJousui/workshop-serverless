import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

import { PARAMETER_OF_WORKSHOR_LIST_QUERY } from "@/constants/constants";
import { listWorkshopDetailsSchema } from "@/models/schemas";
import { listWorkshops } from "@/services/db/workshop/listWorkshops";

export async function lambdaHandler(request) {
  const status =
    request.queryStringParameters[PARAMETER_OF_WORKSHOR_LIST_QUERY];
  const result = await listWorkshops(status);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: { "Content-Type": "application/json" },
  };
}

export const handler = middy()
  .use(validator({ eventSchema: transpileSchema(listWorkshopDetailsSchema) }))
  .use(httpErrorHandler())
  .handler(lambdaHandler);
