export const SALT_ROUNDS: number = 10;

export const isError = (err: unknown): err is Error => err instanceof Error;

export const SUCCESS_RESULT = {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
    headers: { "Content-Type": "application/json" },
};

export const PRISMA_ERROR_CODE = {
    P2002: "P2002",
    P2023: "P2023",
    P2025: "P2025",
};

export const USER_EMAIL_DUPLICATED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーのメールは登録ずみです",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const USER_NOT_EXISTS = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーのメールは未登録です",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const USER_PASSWORD_INCORRECT = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーのメールもしくはパスワードは正しくありません",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const GENERAL_SERVER_ERROR = {
    statusCode: 500,
    body: JSON.stringify({
        errorMessage: "予期せぬエラーが発生しました",
        errorType: "Error",
    }),
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

export const WORKSHOP_STATUS_TYPE_INCORRECT = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "勉強会の種別指定は正しくありません",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_UUID_FORMAT_INCORRECT = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "勉強会のUUIDのフォーマットは正しくありません",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_UUID_NOT_EXISTS = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "勉強会のUUIDの存在しません",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_PARTICIPANT_DUPLICATED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーはすでにこの勉強会に参加登録済みです",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_PARTICIPANT_NOT_EXISTS = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーはすでにこの勉強会に参加していません",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_PARTICIPANT_ALREADY_CANCELED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーはすでにこの勉強会の参加登録はキャセル済みです",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export type WorkshopCreateEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};
