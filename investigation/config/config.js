import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

export const config = {
    baseUrl: process.env.IVY_API_BASE_URL,
    apiKey: process.env.IVY_API_KEY,
    loginEmail: process.env.IVY_LOGIN_EMAIL,
    loginPassword: process.env.IVY_LOGIN_PASSWORD,

    referenceTime: "2026-09-10T00:00:00+05:30"
};