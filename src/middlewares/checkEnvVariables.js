import { errorCatch } from "../utils/index.js";
import { MONGO_URI, MONGO_DB, JWT_SECRET_KEY } from "../constants.js";

export default function checkEnvVariables(req, res, next) {
    try {
        const missingVars = [];
        if (!MONGO_URI) missingVars.push("MONGO_URI");
        if (!MONGO_DB) missingVars.push("MONGO_DB");
        if (!JWT_SECRET_KEY) missingVars.push("JWT_SECRET_KEY");
        if (missingVars.length > 0) throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);

        next();
    } catch (err) {
        errorCatch(err, req, res);
    }
}
