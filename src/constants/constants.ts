export const SALT_ROUNDS: number = 10;

// export const isError = (err: unknown): err is Error => err instanceof Error;

export const SUCCESS_RESULT = {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
    headers: { "Content-Type": "application/json" },
};

export const API_KEY_LIFETIME = 3600 * 1000 * 24;

export const PARAMETER_OF_WORKSHOR_LIST_QUERY = "status";

export const WORKSHOP_STATUS_TYPE_ARRY = [
    "all",
    "ended",
    "ongoing",
    "scheduled",
];

export type WorkshopCreateEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};
