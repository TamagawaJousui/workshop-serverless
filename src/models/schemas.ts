import {
  PARAMETER_OF_WORKSHOP_DEFAULT_STATUS,
  PARAMETER_OF_WORKSHOP_LIST_QUERY,
  PARAMETER_OF_WORKSHOP_UUID,
} from "@/constants/constants";
export const addUserSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email", minLength: 1 },
        password: { type: "string", minLength: 1 },
      },
      additionalProperties: false,
      required: ["name", "email", "password"],
    },
  },
  required: ["body"],
};

export const authUserSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        email: { type: "string", format: "email", minLength: 1 },
        password: { type: "string", minLength: 1 },
      },
      additionalProperties: false,
      required: ["email", "password"],
    },
  },
  required: ["body"],
};

export const addWorkshopSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        start_at: { type: "string", format: "date-time" },
        end_at: { type: "string", format: "date-time" },
        participation_method: { type: "string" },
        content: { type: "string" },
        preparation: { type: "string" },
        materials: { type: "string" },
      },
      additionalProperties: false,
      required: ["start_at", "end_at", "participation_method"],
    },
  },
  required: ["body"],
};

export const updateWorkshopSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        start_at: { type: "string", format: "date-time" },
        end_at: { type: "string", format: "date-time" },
        participation_method: { type: "string" },
        content: { type: "string" },
        preparation: { type: "string" },
        materials: { type: "string" },
      },
      additionalProperties: false,
      required: ["start_at", "end_at", "participation_method"],
    },
    pathParameters: {
      type: "object",
      properties: {
        [PARAMETER_OF_WORKSHOP_UUID]: {
          type: "string",
          format: "uuid",
        },
      },
      additionalProperties: false,
      required: [PARAMETER_OF_WORKSHOP_UUID],
    },
  },
  required: ["body", "pathParameters"],
};

export const getWorkShopDetailSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        [PARAMETER_OF_WORKSHOP_UUID]: {
          type: "string",
          format: "uuid",
        },
      },
      additionalProperties: false,
      required: [PARAMETER_OF_WORKSHOP_UUID],
    },
  },
  required: ["pathParameters"],
};

export const deleteWorkShopDetailSchema = getWorkShopDetailSchema;

export const listWorkshopDetailsSchema = {
  type: "object",
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        [PARAMETER_OF_WORKSHOP_LIST_QUERY]: {
          type: "string",
          enum: ["all", "ended", "ongoing", "scheduled"],
          default: PARAMETER_OF_WORKSHOP_DEFAULT_STATUS,
        },
      },
      additionalProperties: false,
      default: { [PARAMETER_OF_WORKSHOP_LIST_QUERY]: "all" },
    },
  },
};

export const createParticipationSchema = getWorkShopDetailSchema;
export const deleteParticipationSchema = getWorkShopDetailSchema;
export const listParticipantsSchema = getWorkShopDetailSchema;

export const createReviewSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        content: {
          type: "string",
        },
      },
      required: ["content"],
      additionalProperties: false,
    },
    pathParameters: {
      type: "object",
      properties: {
        [PARAMETER_OF_WORKSHOP_UUID]: {
          type: "string",
          format: "uuid",
        },
      },
      additionalProperties: false,
      required: [PARAMETER_OF_WORKSHOP_UUID],
    },
  },
  required: ["body", "pathParameters"],
};
export const pointSchema = {};