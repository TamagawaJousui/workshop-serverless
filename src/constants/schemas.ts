import {
    PARAMETER_OF_WORKSHOP_UUID,
    PARAMETER_OF_WORKSHOR_LIST_QUERY,
    PARAMETER_OF_WORKSHOP_DEFAULT_STATUS,
} from "../constants/constants";
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
};

export const addEditWorkshopSchema = {
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

export const listWorkshopDetailsSchema = {
    type: "object",
    properties: {
        queryStringParameters: {
            type: "object",
            properties: {
                [PARAMETER_OF_WORKSHOR_LIST_QUERY]: {
                    type: "string",
                    enum: ["all", "ended", "ongoing", "scheduled"],
                    default: PARAMETER_OF_WORKSHOP_DEFAULT_STATUS,
                },
            },
            additionalProperties: false,
            default: { [PARAMETER_OF_WORKSHOR_LIST_QUERY]: "all" },
        },
    },
};
