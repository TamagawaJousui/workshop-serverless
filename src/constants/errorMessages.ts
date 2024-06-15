import exp from "node:constants";

export const PRISMA_ERROR_CODE = {
    P2002: "P2002",
    P2003: "P2003",
    P2016: "P2016",
    P2023: "P2023",
    P2025: "P2025",
};

export const USER_NOT_EXISTS_ERROR_MESSAGE = "ユーザーは存在しません";

export const USER_EMAIL_DUPLICATED_ERROR_MESSAGE =
    "ユーザーのメールは登録ずみです";
export const USER_EMAIL_DUPLICATED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーのメールは登録ずみです",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const USER_AUTHENTICATION_FAILED_ERROR_MESSAGE =
    "ユーザーのメールもしくはパスワードは正しくありません";

export const USER_AUTHENTICATION_FAILED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: USER_AUTHENTICATION_FAILED_ERROR_MESSAGE,
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const API_KEY_TYPE_INCORRECT_ERROR_MESSAGE =
    "API KEYの種別が正しくありません";

export const API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE =
    "API KEYの認証は失敗しました";
export const API_KEY_AUTHENTICATION_FAILED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "API KEYの認証は失敗しました",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const USER_AUTHORITY_FAILED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: "ユーザーはこの操作を実行する権限はありません",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const GENERAL_SERVER_ERROR_MESSGAE = "予期せぬエラーが発生しました";
export const GENERAL_SERVER_ERROR = {
    statusCode: 500,
    body: JSON.stringify({
        errorMessage: "予期せぬエラーが発生しました",
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

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

export const WORKSHOP_NOT_EXISTS_ERROR_MESSAGE = "勉強会のUUIDの存在しません";
export const WORKSHOP_UUID_NOT_EXISTS = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: WORKSHOP_NOT_EXISTS_ERROR_MESSAGE,
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE =
    "ユーザーはすでにこの勉強会に参加登録済みです";
export const WORKSHOP_PARTICIPANT_DUPLICATED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE,
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE =
    "ユーザーはすでにこの勉強会に参加していません、若しくはキャセル済みです";
export const WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED = {
    statusCode: 400,
    body: JSON.stringify({
        errorMessage: WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE,
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};

export const WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE =
    "ユーザーのこの勉強会の参加記録が破損しました、システム管理者に連絡してください";
export const WORKSHOP_PARTICIPANT_RECORD_CORRUPTED = {
    statusCode: 500,
    body: JSON.stringify({
        errorMessage: WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE,
        errorType: "Error",
    }),
    headers: { "Content-Type": "application/json" },
};
