export const PRISMA_ERROR_CODE = {
  P2002: "P2002", // "Unique constraint failed on the {constraint}"
  P2003: "P2003", //"Foreign key constraint failed on the field: {field_name}"
  P2025: "P2025", //"An operation failed because it depends on one or more records that were required but not found. {cause}"
};

export const USER_EMAIL_DUPLICATED_ERROR_MESSAGE =
  "ユーザーのメールは登録済みです";
export const USER_AUTHENTICATION_FAILED_ERROR_MESSAGE =
  "ユーザーのメールもしくはパスワードは正しくありません";
export const API_KEY_AUTHENTICATION_FAILED_ERROR_MESSAGE =
  "API KEYの認証は失敗しました";
export const USER_FORBIDDEN_ERROR_MESSAGE =
  "ユーザーはこの操作をする権限はありません";
export const WORKSHOP_NOT_EXISTS_ERROR_MESSAGE =
  "この操作ができる勉強会は存在しません";
export const WORKSHOP_PARTICIPANT_DUPLICATED_ERROR_MESSAGE =
  "ユーザーはすでにこの勉強会に参加登録済みです";
export const WORKSHOP_PARTICIPANT_NOT_EXISTS_OR_CANCELED_ERROR_MESSAGE =
  "ユーザーはすでにこの勉強会に参加していません、若しくはキャセル済みです";
export const WORKSHOP_PARTICIPANT_RECORD_CORRUPTED_ERROR_MESSAGE =
  "ユーザーのこの勉強会の参加記録が破損しました";
