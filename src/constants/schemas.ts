export const addUserschema = {
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

export const authUserschema = {
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
