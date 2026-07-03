import { ALLOWED_USER_FIELDS } from "../constants.js";

export function getValidEditUserInput(body) {
    return Object.keys(body || {}).reduce((acc, key) => ({ ...acc, ...(ALLOWED_USER_FIELDS.includes(key) ? { [key]: body[key] } : {}) }), {});
}