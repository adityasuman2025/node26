export const PORT = process.env.PORT || 2000;
export const MONGO_URI = process.env.MONGO_URI;
export const MONGO_DB = process.env.MONGO_DB;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const AUTH_TOKEN_KEY = "token";

export const ALLOWED_USER_FIELDS = ["name", "profilePic", "address", "gender", "age", "skills"];