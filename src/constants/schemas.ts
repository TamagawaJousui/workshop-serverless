export const addUserschema = {
    type: "object",
    properties: {
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                password: { type: "string" },
            },
            required: ["name", "email", "password"],
        },
    },
};
