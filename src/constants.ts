export const SALT_ROUNDS: number = 10;

export const SUCCESS_RESULT = {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
    headers: { "Content-Type": "application/json" },
};

export const PRISMA_ERROR_CODE = {
    P2002: "P2002",
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
