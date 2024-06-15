import { apiKeyLifetime } from "@/env";
export const SALT_ROUNDS = 10;
// default 5 mins
export const API_KEY_LIFETIME = Number.parseInt(apiKeyLifetime) ?? 300 * 1000;
export const PARAMETER_OF_WORKSHOR_LIST_QUERY = "status";
export const PARAMETER_OF_WORKSHOP_UUID = "workshop_UUID";
export type Status = "all" | "ended" | "ongoing" | "scheduled";
export const PARAMETER_OF_WORKSHOP_DEFAULT_STATUS = "all";
